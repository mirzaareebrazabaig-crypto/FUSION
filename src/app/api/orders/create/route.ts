import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { razorpayInstance } from "@/lib/razorpay";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      customerName,
      customerPhone,
      customerEmail,
      houseFlat,
      streetArea,
      landmark,
      city = "Hyderabad",
      pincode,
      deliveryDate,
      deliverySlot,
      boxMessage,
      specialNotes,
      items,
      couponCode,
    } = body;

    // 1. Validation checks
    if (!customerName || !customerPhone || !houseFlat || !streetArea || !pincode || !deliveryDate || !deliverySlot) {
      return NextResponse.json(
        { success: false, error: "Please fill in all mandatory fields." },
        { status: 400 }
      );
    }

    const cleanPhone = customerPhone.replace(/[^0-9]/g, "");
    if (cleanPhone.length !== 10) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid 10-digit mobile number." },
        { status: 400 }
      );
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: "Your cart is empty. Please add delicious chocolates to proceed." },
        { status: 400 }
      );
    }

    // 2. Validate Pincode format (Anywhere in city allowed via Rapido / Porter)
    const cleanPin = pincode.trim().replace(/[^0-9]/g, "");
    if (cleanPin.length !== 6) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid 6-digit postal PIN code." },
        { status: 400 }
      );
    }

    // 3. Validate Blocked Date
    const blocked = await prisma.blockedDate.findUnique({
      where: { date: deliveryDate },
    });
    if (blocked) {
      return NextResponse.json(
        { success: false, error: `Delivery is closed on ${deliveryDate}: ${blocked.reason}. Please select another date.` },
        { status: 400 }
      );
    }

    // 4. Calculate pricing from database products (Secure server-side re-calculation)
    const productIds = items.map((i: any) => i.productId);
    const dbProducts = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    const productMap = new Map(dbProducts.map((p) => [p.id, p]));

    let calculatedSubtotal = 0;
    const orderItemsData: any[] = [];

    for (const item of items) {
      const dbProduct = productMap.get(item.productId);
      if (!dbProduct) {
        return NextResponse.json(
          { success: false, error: `Product not found or unavailable: ${item.name}` },
          { status: 400 }
        );
      }
      if (!dbProduct.inStock) {
        return NextResponse.json(
          { success: false, error: `Sorry, ${dbProduct.name} is currently out of stock.` },
          { status: 400 }
        );
      }

      // Check variant price if applicable
      let itemPrice = dbProduct.price;
      if (item.variantName && dbProduct.variants) {
        try {
          const variants = JSON.parse(dbProduct.variants);
          const matchedVariant = variants.find((v: any) => v.name === item.variantName);
          if (matchedVariant) {
            itemPrice = matchedVariant.price;
          }
        } catch {
          // fallback to base price
        }
      }

      const itemTotal = itemPrice * item.quantity;
      calculatedSubtotal += itemTotal;

      orderItemsData.push({
        productId: dbProduct.id,
        productName: dbProduct.name,
        variantName: item.variantName || null,
        price: itemPrice,
        quantity: item.quantity,
        total: itemTotal,
      });
    }

    // 5. Calculate Delivery Fee (Flat Rapido / Porter parcel charges across Hyderabad)
    const deliveryFee = 75;

    // 6. Calculate Coupon Discount
    let discount = 0;
    let validCouponCode = null;

    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: couponCode.trim().toUpperCase() },
      });

      if (coupon && coupon.isActive && calculatedSubtotal >= coupon.minOrderValue) {
        if (!coupon.expiryDate || new Date(coupon.expiryDate) >= new Date()) {
          validCouponCode = coupon.code;
          if (coupon.discountType === "PERCENTAGE") {
            discount = Math.round((calculatedSubtotal * coupon.discountValue) / 100);
            if (coupon.maxDiscount && discount > coupon.maxDiscount) {
              discount = coupon.maxDiscount;
            }
          } else {
            discount = coupon.discountValue;
          }
          discount = Math.min(discount, calculatedSubtotal);
        }
      }
    }

    const total = Math.max(0, calculatedSubtotal - discount + deliveryFee);

    // 7. Generate readable order number: CF-YYMM-XXXX
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const datePrefix = new Date().toISOString().slice(2, 7).replace("-", "");
    const orderNumber = `CF-${datePrefix}-${randomSuffix}`;

    // 8. Create Order in DB (paymentStatus: PENDING)
    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerName: customerName.trim(),
        customerPhone: cleanPhone,
        customerEmail: customerEmail?.trim() || null,
        houseFlat: houseFlat.trim(),
        streetArea: streetArea.trim(),
        landmark: landmark?.trim() || null,
        city: city.trim(),
        pincode: pincode.trim(),
        deliveryDate,
        deliverySlot,
        boxMessage: boxMessage?.trim() || null,
        specialNotes: specialNotes?.trim() || null,
        subtotal: calculatedSubtotal,
        deliveryFee,
        discount,
        couponCode: validCouponCode,
        total,
        paymentStatus: "PENDING",
        orderStatus: "CONFIRMED",
        items: {
          create: orderItemsData,
        },
      },
      include: {
        items: true,
      },
    });

    // 9. Create Razorpay Order
    let razorpayOrderId = `order_sim_${Date.now()}`;
    let isLiveRazorpay = false;

    try {
      const rzpOrder = await razorpayInstance.orders.create({
        amount: Math.round(total * 100), // amount in paise
        currency: "INR",
        receipt: orderNumber,
        notes: {
          orderId: order.id,
          customerName: order.customerName,
          customerPhone: order.customerPhone,
        },
      });

      if (rzpOrder && rzpOrder.id) {
        razorpayOrderId = rzpOrder.id;
        isLiveRazorpay = true;
      }
    } catch (rzpErr: any) {
      console.warn("Razorpay API order creation fallback:", rzpErr.message);
      // Keep simulated razorpayOrderId so local test flow works seamlessly
    }

    // Update order with razorpayOrderId
    await prisma.order.update({
      where: { id: order.id },
      data: { razorpayOrderId },
    });

    const keyId =
      process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ||
      process.env.RAZORPAY_KEY_ID ||
      "rzp_test_ChocoFusion99";

    return NextResponse.json({
      success: true,
      orderId: order.id,
      orderNumber: order.orderNumber,
      razorpayOrderId,
      amount: Math.round(total * 100),
      currency: "INR",
      keyId,
      isLiveRazorpay,
      customer: {
        name: order.customerName,
        phone: order.customerPhone,
        email: order.customerEmail,
      },
    });
  } catch (err: any) {
    console.error("Order creation error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to create order" },
      { status: 500 }
    );
  }
}
