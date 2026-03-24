// Razorpay Payment Service

declare global {
  interface Window {
    Razorpay: any;
  }
}

export interface RazorpayOptions {
  amount: number;          // in paise (INR) or smallest currency unit
  currency: string;
  bookingId: string;
  consultantName: string;
  sessionDuration: number;
  userName: string;
  userEmail: string;
  onSuccess: (paymentId: string, orderId: string) => void;
  onFailure: (error: any) => void;
}

// Load Razorpay script dynamically
export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export async function initiateRazorpayPayment(options: RazorpayOptions): Promise<void> {
  const loaded = await loadRazorpayScript();
  if (!loaded) {
    throw new Error('Failed to load payment gateway. Please check your connection.');
  }

  const keyId = import.meta.env.VITE_RAZORPAY_KEY_ID;
  if (!keyId) {
    throw new Error('Payment gateway is not configured.');
  }

  // Amount must be in paise (multiply USD/INR by 100)
  const razorpayOptions = {
    key: keyId,
    amount: options.amount * 100, // convert to paise
    currency: options.currency || 'INR',
    name: 'Foundrly',
    description: `${options.sessionDuration}-min consultation with ${options.consultantName}`,
    image: '/favicon.ico',
    order_id: options.bookingId, // use booking ID as reference
    prefill: {
      name: options.userName,
      email: options.userEmail,
    },
    notes: {
      booking_id: options.bookingId,
      consultant: options.consultantName,
      duration: `${options.sessionDuration} minutes`,
    },
    theme: {
      color: '#F5A623', // Foundrly gold
    },
    modal: {
      ondismiss: () => {
        options.onFailure({ message: 'Payment cancelled by user' });
      },
    },
    handler: (response: any) => {
      options.onSuccess(
        response.razorpay_payment_id,
        response.razorpay_order_id || options.bookingId
      );
    },
  };

  const rzp = new window.Razorpay(razorpayOptions);
  rzp.on('payment.failed', (response: any) => {
    options.onFailure(response.error);
  });
  rzp.open();
}
