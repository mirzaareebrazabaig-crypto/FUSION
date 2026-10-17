import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { razorpayInstance } from "@/lib/razorpay";
import { STATIC_PRODUCTS } from "@/lib/productsData";

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

    // 1. Mandatory Validations
    if (!customerName || !customerPhone || !houseFlat || !streetArea || !pincode || !deliveryDate || !deliverySlot) {
      return NextResponse.json(
        { success: false, error: "Missing required delivery fields. Please check your address & contact info." },
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

    // 3. Validate Blocked Date (wrapped in try/catch to protect against unseeded DBs)
    try {
      const blocked = await prisma.blockedDate.findUnique({
        where: { date: deliveryDate },
      });
      if (blocked) {
        return NextResponse.json(
          { success: false, error: `Delivery is closed on ${deliveryDate}: ${blocked.reason}. Please select another date.` },
          { status: 400 }
        );
      }
    } catch (dateErr) {
      console.warn("BlockedDate check fallback:", dateErr);
    }

    // 4. Calculate pricing from database products or fallback to STATIC_PRODUCTS
    const productIds = items.map((i: any) => i.productId);
    let dbProducts: any[] = [];
    try {
      dbProducts = await prisma.product.findMany({
        where: { id: { in: productIds } },
      });
    } catch (prodErr) {
      console.warn("Product query fallback to static:", prodErr);
    }

    const productMap = new Map(dbProducts.map((p) => [p.id, p]));
    const staticMap = new Map(STATIC_PRODUCTS.map((p) => [p.id, p]));

    let calculatedSubtotal = 0;
    const orderItemsData: any[] = [];

    for (const item of items) {
      const product = productMap.get(item.productId) || staticMap.get(item.productId);
      
      // If product not found in either, use item price passed safely
      let itemPrice = product?.price || item.price || 120;
      const productName = product?.name || item.name || "Handcrafted Chocolate";

      if (item.variantName && product?.variants) {
        try {
          const variants = JSON.parse(product.variants);
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
        productId: product?.id || item.productId,
        productName: productName,
        variantName: item.variantName || null,
        price: itemPrice,
        quantity: item.quantity,
        total: itemTotal,
      });
    }

    // 5. Delivery Fee: ₹0 in product payment (Rapido / Porter charges at actuals on delivery)
    const deliveryFee = 0;
    const discount = 0;
    const total = Math.max(0, calculatedSubtotal - discount + deliveryFee);

    // 6. Generate readable order number: CF-YYMM-XXXX
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const datePrefix = new Date().toISOString().slice(2, 7).replace("-", "");
    const orderNumber = `CF-${datePrefix}-${randomSuffix}`;
    const orderId = `ord_${Date.now()}_${randomSuffix}`;

    // 7. Save customer & order in DB if accessible
    try {
      await prisma.customer.upsert({
        where: { phone: cleanPhone },
        update: {
          name: customerName.trim(),
          email: customerEmail?.trim() || undefined,
          houseFlat: houseFlat.trim(),
          streetArea: streetArea.trim(),
          landmark: landmark?.trim() || undefined,
          city: city.trim(),
          pincode: pincode.trim(),
        },
        create: {
          phone: cleanPhone,
          name: customerName.trim(),
          email: customerEmail?.trim() || null,
          houseFlat: houseFlat.trim(),
          streetArea: streetArea.trim(),
          landmark: landmark?.trim() || null,
          city: city.trim(),
          pincode: pincode.trim(),
        },
      });

      await prisma.order.create({
        data: {
          id: orderId,
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
          couponCode: null,
          total,
          paymentStatus: "PENDING",
          orderStatus: "CONFIRMED",
          items: {
            create: orderItemsData,
          },
        },
      });
    } catch (dbErr) {
      console.warn("DB order write skipped or fallback:", dbErr);
    }

    // 8. Create Razorpay Order
    let razorpayOrderId = `order_sim_${Date.now()}`;
    let isLiveRazorpay = false;

    try {
      const rzpOrder = await razorpayInstance.orders.create({
        amount: Math.round(total * 100), // amount in paise
        currency: "INR",
        receipt: orderNumber,
        notes: {
          orderId,
          customerName: customerName.trim(),
          customerPhone: cleanPhone,
        },
      });

      if (rzpOrder && rzpOrder.id) {
        razorpayOrderId = rzpOrder.id;
        isLiveRazorpay = true;
      }
    } catch (rzpErr: any) {
      console.warn("Razorpay API order creation fallback:", rzpErr.message);
    }

    const keyId =
      process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ||
      process.env.RAZORPAY_KEY_ID ||
      "rzp_test_ChocoFusion99";

    return NextResponse.json({
      success: true,
      orderId,
      orderNumber,
      amount: Math.round(total * 100),
      currency: "INR",
      keyId,
      razorpayOrderId,
      isLiveRazorpay,
      customer: {
        name: customerName,
        phone: cleanPhone,
        email: customerEmail,
      },
    });
  } catch (err: any) {
    console.error("Order creation fatal error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to initiate order." },
      { status: 500 }
    );
  }
}
