import React, { useState } from "react";
import { Helmet } from "react-helmet-async"; // SEO with Helmet
import { Link, useNavigate } from "react-router-dom";
import { useGoogleLoginMutation, useSignupMutation } from "../../redux/apiSlice.auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import loginImage from "../../../public/login/signin-bg.png";
import { GoDeviceMobile, GoLocation, GoMail, GoPerson } from "react-icons/go";
import { FaGoogle } from "react-icons/fa";
import Logo from "../../../public/logo/brandlogo.png";
import CustomButton from "../../components/global/button/CustomButton";
import { PasswordField } from "../../components/global/inputfield/PasswordField";
import { InputField } from "../../components/global/inputfield/InputField";
import { userSchema } from "../../validationSchema/userRegistrationSchema";
import useProtectAfterLogin from "../../hooks/useProtectAfterLogin";
import { signInWithGoogle } from "../../utils/googleAuthProvider";
import { useDispatch } from "react-redux";
import { login } from "../../redux/authSlice";

export default function Signup() {
  useProtectAfterLogin(["user"], "/"); // Protect users already logged in
  const [isShowPassword, setIsShowPassword] = useState(false);
  const [isShowPasswordCon, setIsShowPasswordCon] = useState(false);
  const navigate = useNavigate();
   const [googleLoginMutation, ] = useGoogleLoginMutation();
   const dispatch = useDispatch();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(userSchema) });

  const [signup, { isLoading }] = useSignupMutation();

  const onSubmit = async (data) => {
    const {
      email,
      password,
      confirmPassword,
      username,
      phone_number,
      wedding_date,
      wedding_location,
    } = data;

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      const response = await signup({
        email,
        password,
        user_name: username,
        phone_number,
        wedding_date: new Date(wedding_date).toISOString(),
        wedding_location,
      }).unwrap();
      toast.success(response.message);
      navigate("/login");
    } catch (error) {
      toast.error(
        `Signup failed: ${error?.data?.message || "Something went wrong"}`
      );
    }
  };

    const handleGoogleLogin = async () => {
      const { googleUser } = await signInWithGoogle();
    
      const token = await googleUser.getIdToken();
    
      if (googleUser) {
        const { success, user, message } = await googleLoginMutation({
          googleUid: googleUser.uid,
          email: googleUser.email,
          displayName: googleUser.displayName,
          photoURL: googleUser.photoURL,
          googleIdToken: token,
        }).unwrap();
    
        if (success) {
          dispatch(login(user));
          toast.success(message);
        }
      }
    };

  return (
    <div className="mt-3 flex md:py-5 px-10">
      {/* Helmet for SEO */}
      <Helmet>
        <title>Signup | Marriage Vendors</title>
        <meta
          name="description"
          content="Create a new account on Marriage Vendors to organize and plan your wedding seamlessly. Sign up to explore services."
        />
        <meta
          name="keywords"
          content="signup, marriage vendors, wedding account, wedding planning ,signup, marriage vendors, wedding planning, wedding account, wedding organization, create an account, event management, wedding services, vendor management, bride account, groom account, wedding checklist, online wedding planning, wedding venues, wedding photographers, wedding florists, wedding event organizers, wedding planners, wedding inspiration, wedding trends, wedding packages"
        />
        <meta name="author" content="Marriage Vendors" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://www.marriagevendors.com/signup" />

        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: "Signup | Marriage Vendors",
            description:
              "Create a new account on Marriage Vendors to organize and plan your wedding seamlessly. Sign up to explore services.",
            url: "https://www.marriagevendors.com/signup",
            potentialAction: {
              "@type": "RegisterAction",
              target: "https://www.marriagevendors.com/signup",
            },
          })}
        </script>
      </Helmet>

      <div className="flex h-[85vh] items-center justify-center md:space-x-10 w-full">
        {/* Image Section */}
        <div className="hidden md:block w-2/5">
            <img
              src={loginImage}
              className="h-[85vh] w-full object-cover object-center rounded-lg"
              alt="Login Illustration"
            />
        </div>

       
        {/* Form Section */}
        <div className="sm:bg-white bg-transparent items-center flex-col justify-center rounded-lg sm:px-8 md:px-[10rem] w-full space-y-6">
          <img
            src={Logo}
            className="h-20 w-20 object-cover object-center rounded-md mx-auto mt-4"
            alt="Logo"
          />
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="bg-transparent h-auto w-full p-2 md:px-8 rounded-lg"
          >
            <h1 className="text-3xl font-bold text-black mb-3 text-center">
              Create Your Account | Marriage Vendors
            </h1>

            {/* Username */}
           <div className="flex items-center justify-between gap-x-3">
            <InputField
                id="username"
                type="text"
                label="Username"
                register={register}
                error={errors.username}
                icon={<GoPerson size={19} className="text-gray-500" />}
                placeholder="Username"
              />

              {/* Email */}
              <InputField
                id="email"
                type="email"
                label="Email"
                register={register}
                error={errors.email}
                icon={<GoMail size={19} className="text-gray-500" />}
                placeholder="Email"
              />
           </div>

            {/* Password Fields */}
            <div className="flex items-center justify-between gap-x-3">
              <PasswordField
                label="Password"
                id="password"
                register={register}
                isShow={isShowPassword}
                setIsShow={setIsShowPassword}
                error={errors.password}
              />
              <PasswordField
                label="Confirm Password"
                id="confirmPassword"
                register={register}
                isShow={isShowPasswordCon}
                setIsShow={setIsShowPasswordCon}
                error={errors.confirmPassword}
              />
            </div>

            {/* Location and Phone */}
            <div className="flex items-center justify-between gap-x-3">
              <InputField
                id="wedding_location"
                type="text"
                label="Event Location"
                register={register}
                error={errors.wedding_location}
                icon={<GoLocation size={19} className="text-gray-500" />}
                placeholder="Event Location"
              />
              <InputField
                id="phone_number"
                type="text"
                label="Phone Number"
                register={register}
                error={errors.phone_number}
                icon={<GoDeviceMobile size={20} className="text-gray-500" />}
                placeholder="Phone Number"
              />
            </div>

            {/* Event Date */}
            <div className="mb-6 w-full">
              <label
                htmlFor="wedding_date"
                className="block text-gray-700 text-sm font-bold mb-2"
              >
                Event Date
              </label>
              <input
                type="date"
                id="wedding_date"
                {...register("wedding_date")}
                className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-md"
              />
              {errors.wedding_date && (
                <p className="text-red-500 text-sm">
                  {errors.wedding_date.message}
                </p>
              )}
            </div>

            {/* Terms of Service */}
            <div className="flex items-center mb-5 px-2">
              <input
                id="link-checkbox"
                type="checkbox"
                className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded-md"
              />
              <label
                htmlFor="link-checkbox"
                className="ms-2 text-sm font-medium text-gray-900"
              >
                I agree with the{" "}
                <a
                  href="/terms.html"
                  className="text-primary dark:text-blue-500 hover:underline"
                >
                  terms and conditions
                </a>
                .
              </label>
            </div>

            {/* Submit Button */}
            <div className="flex md:flex-col md:gap-3 gap-2 items-center justify-center w-full">
              <button
                type="submit"
                disabled={isLoading}
                className={`w-[50%] ${
                  isLoading ? "bg-primary-300" : "bg-primary"
                } disabled:cursor-not-allowed cursor-pointer border-2 text-foreground font-bold py-2 px-4 rounded`}
              >
                {isLoading ? "Please wait..." : "Sign up"}
              </button>

              <div className="my-4 items-center justify-between w-[70%] gap-x-5 md:flex hidden">
                <div className="h-[1px] px-3 w-[50%] bg-gray-300"></div>
                <span className="text-2xl text-center">Or</span>
                <div className="h-[1px] px-3 w-[50%] bg-gray-300"></div>
              </div>

              <CustomButton
                onClick={handleGoogleLogin}
                type="button"
                text="Login with Google"
                leftIcon={<FaGoogle size={20} className="text-red-500" />}
                className="w-[50%] py-2 bg-white text-red-600 border-2 border-sageGreen-dark hover:bg-sageGreen-light"
              />

            </div>
            <div className="mt-4">
                <p className="text-sm text-gray-700 text-center">
                  Already have an account?{" "}
                  <Link to="/login" className="text-primary font-medium">
                    Login
                  </Link>
                </p>
              </div>
          </form>
        </div>
      </div>
    </div>
  );
}