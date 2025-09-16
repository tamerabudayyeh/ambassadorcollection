import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Fetch payment methods for the authenticated user
    const { data: paymentMethods, error: methodsError } = await supabase
      .from('payment_methods')
      .select('*')
      .eq('guest_id', user.id)
      .eq('is_active', true)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false });

    if (methodsError) {
      console.error('Error fetching payment methods:', methodsError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch payment methods' },
        { status: 500 }
      );
    }

    // Transform the data to match the frontend interface
    const transformedMethods = paymentMethods?.map(method => ({
      id: method.stripe_payment_method_id,
      type: method.type,
      last4: method.card_last4,
      brand: method.card_brand,
      expiryMonth: method.card_exp_month,
      expiryYear: method.card_exp_year,
      isDefault: method.is_default,
      billingDetails: method.billing_details,
      createdAt: method.created_at,
    })) || [];

    return NextResponse.json({
      success: true,
      paymentMethods: transformedMethods,
    });
  } catch (error) {
    console.error('Error in GET /api/guests/payment-methods:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { paymentMethodId, isDefault = false } = await request.json();

    if (!paymentMethodId) {
      return NextResponse.json(
        { success: false, error: 'Payment method ID is required' },
        { status: 400 }
      );
    }

    // Use the payment service to save the payment method
    const { paymentService } = await import('@/lib/stripe/payment-service');
    
    await paymentService.savePaymentMethod(user.id, paymentMethodId, isDefault);

    return NextResponse.json({
      success: true,
      message: 'Payment method saved successfully',
    });
  } catch (error) {
    console.error('Error in POST /api/guests/payment-methods:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save payment method' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = createClient();
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const paymentMethodId = searchParams.get('id');

    if (!paymentMethodId) {
      return NextResponse.json(
        { success: false, error: 'Payment method ID is required' },
        { status: 400 }
      );
    }

    // Soft delete the payment method
    const { error: deleteError } = await supabase
      .from('payment_methods')
      .update({ is_active: false })
      .eq('stripe_payment_method_id', paymentMethodId)
      .eq('guest_id', user.id);

    if (deleteError) {
      console.error('Error deleting payment method:', deleteError);
      return NextResponse.json(
        { success: false, error: 'Failed to delete payment method' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Payment method removed successfully',
    });
  } catch (error) {
    console.error('Error in DELETE /api/guests/payment-methods:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to remove payment method' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = createClient();
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { paymentMethodId, isDefault } = await request.json();

    if (!paymentMethodId) {
      return NextResponse.json(
        { success: false, error: 'Payment method ID is required' },
        { status: 400 }
      );
    }

    // If setting as default, first remove default from all other methods
    if (isDefault) {
      await supabase
        .from('payment_methods')
        .update({ is_default: false })
        .eq('guest_id', user.id);
    }

    // Update the specified payment method
    const { error: updateError } = await supabase
      .from('payment_methods')
      .update({ is_default: isDefault })
      .eq('stripe_payment_method_id', paymentMethodId)
      .eq('guest_id', user.id);

    if (updateError) {
      console.error('Error updating payment method:', updateError);
      return NextResponse.json(
        { success: false, error: 'Failed to update payment method' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Payment method updated successfully',
    });
  } catch (error) {
    console.error('Error in PATCH /api/guests/payment-methods:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update payment method' },
      { status: 500 }
    );
  }
}