import { useSelector } from "react-redux";
import Plan from "./vendorDashboard/component/Plan";
import { useCreateOrderMutation } from "../redux/payment";
import { toast } from "react-toastify";

// Function to dynamically load external scripts
function loadScript(src) {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

function Subscription() {
  const user = useSelector((state) => state.auth.user); // Get user info from Redux state
  const [createPlan, { isLoading, error }] = useCreateOrderMutation(); // Destructure API hooks

  // Function to initiate Razorpay checkout
  async function displayRazorpay(planId) {
    // Load Razorpay SDK dynamically
    const res = await loadScript("https://checkout.razorpay.com/v1/checkout.js");
    if (!res) {
      alert("Razorpay SDK failed to load. Please check your internet connection.");
      return;
    }

    try {
      // Create a payment order
      const { order } = await createPlan({ planId }).unwrap();
      if (!order) {
        alert("Failed to create Razorpay order!");
        return;
      }

      // Razorpay options configuration
      const options = {
        key: import.meta.env.VITE_PAY_ID, // Razorpay API key from environment variables
        amount: order.amount * 100, // Convert to paise
        currency: order.currency,
        name: "marriagevendors",
        description: `Subscription Plan`,
        image: "https://www.marriagevendors.com/assets/brandlogo-U4Jufhk5.png", // Optional logo
        order_id: order.id, 
        handler: async function (response) {
          const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = response;
          try {
            // Prepare the request payload
            const payload = {
              razorpay_payment_id,
              razorpay_order_id,
              razorpay_signature,
            };

            // Validate payment using fetch
            const validateResponse = await fetch(
              `${import.meta.env.VITE_API_URL}/api/v1/subscribe/verify-payment`, 
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
                credentials: "include"
              }
            );

            // Check if the response is successful (status code 200-299)
            if (!validateResponse.ok) {
              throw new Error(`HTTP error! Status: ${validateResponse.status}`);
            }

            // Parse the response JSON
            const data = await validateResponse.json();

            toast.success("Payment successful!");
            // You can update your UI state to reflect payment success here
          } catch (error) {
            // Improved error handling with detailed information
            console.error("Payment validation failed. Details:", {
              message: error.message,
              stack: error.stack,
            });
            // Optionally, display an error message to the user
            alert("Payment validation failed. Please try again or contact support.");
          }
        },
        prefill: {
          name: user?.name || "Guest",
          email: user?.email || "guest@example.com",
          contact: user?.phone_number || "0000000000",
        },
        notes: {
          address: "Razorpay Corporate Office",
        },
        theme: {
          color: "#d43fa6",
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (err) {
      console.error("Error creating Razorpay order:", err);
      alert("Something went wrong while initiating payment. Please try again.");
    }
  }

  return (
    <div className="  ">
      <header className="">
        {isLoading ? (
          <div>Loading...</div>
        ) : error ? (
          <div className="text-red-500">Error: {error.message}</div> // Display API error
        ) : (
          <Plan displayRazorpay={displayRazorpay} /> 
        )}
      </header>
    </div>
  );
}

export default Subscription;
