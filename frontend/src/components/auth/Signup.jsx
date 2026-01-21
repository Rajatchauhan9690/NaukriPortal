import React, { useEffect, useState } from "react";
import Navbar from "../shared/Navbar";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { RadioGroup } from "../ui/radio-group";
import { Button } from "../ui/button";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { USER_API_END_POINT } from "@/utils/constant";
import { toast } from "sonner";
import { useDispatch, useSelector } from "react-redux";
import { setLoading } from "@/redux/authSlice";
import { Loader2 } from "lucide-react";

const Signup = () => {
  const [input, setInput] = useState({
    fullname: "",
    email: "",
    phoneNumber: "",
    password: "",
    role: "",
    file: null,
  });

  const { loading, user } = useSelector((store) => store.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const changeEventHandler = (e) =>
    setInput({ ...input, [e.target.name]: e.target.value });

  const changeFileHandler = (e) =>
    setInput({ ...input, file: e.target.files?.[0] });

  const submitHandler = async (e) => {
    e.preventDefault();

    // Basic validations
    if (!input.fullname) return toast.error("Full name is required");
    if (!input.email) return toast.error("Email is required");
    if (!input.phoneNumber) return toast.error("Phone number is required");
    if (!input.password) return toast.error("Password is required");
    if (!input.role) return toast.error("Please select a role");

    if (input.password.length < 6)
      return toast.error("Password must be at least 6 characters");

    if (isNaN(input.phoneNumber))
      return toast.error("Phone number must be numeric");

    // Image validation
    if (!input.file) return toast.error("Profile photo is required");

    const allowedTypes = ["image/jpeg", "image/webp"];
    if (!allowedTypes.includes(input.file.type)) {
      return toast.error("Only JPEG and WEBP images are allowed");
    }

    const maxSize = 1 * 1024 * 1024; // 1MB
    if (input.file.size > maxSize) {
      return toast.error("Image size must be less than 1MB");
    }

    const formData = new FormData();
    Object.keys(input).forEach((key) => {
      if (input[key]) formData.append(key, input[key]);
    });

    try {
      dispatch(setLoading(true));

      const res = await axios.post(`${USER_API_END_POINT}/register`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });

      toast.success(res.data.message);
      navigate("/login");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Signup failed");
    } finally {
      dispatch(setLoading(false));
    }
  };

  useEffect(() => {
    if (user) navigate("/");
  }, [user]);

  return (
    <div>
      <Navbar />
      <div className="flex items-center justify-center max-w-7xl mx-auto">
        <form
          onSubmit={submitHandler}
          className="w-[40%] border border-gray-200 rounded-md p-4 my-5"
        >
          <h1 className="font-bold text-xl mb-3 text-center">Sign Up</h1>

          <div className="my-2">
            <Label>Full Name</Label>
            <Input
              name="fullname"
              value={input.fullname}
              onChange={changeEventHandler}
            />
          </div>

          <div className="my-2">
            <Label>Email</Label>
            <Input
              type="email"
              name="email"
              value={input.email}
              onChange={changeEventHandler}
            />
          </div>

          <div className="my-2">
            <Label>Phone Number</Label>
            <Input
              name="phoneNumber"
              value={input.phoneNumber}
              onChange={changeEventHandler}
            />
          </div>

          <div className="my-2">
            <Label>Password</Label>
            <Input
              type="password"
              name="password"
              value={input.password}
              onChange={changeEventHandler}
            />
          </div>

          <RadioGroup className="flex items-center gap-4 my-5">
            {["student", "recruiter"].map((roleType) => (
              <div key={roleType} className="flex items-center space-x-2">
                <Input
                  type="radio"
                  id={roleType} // <-- add id
                  name="role"
                  value={roleType}
                  checked={input.role === roleType}
                  onChange={changeEventHandler}
                  required
                />
                <Label htmlFor={roleType}>
                  {roleType.charAt(0).toUpperCase() + roleType.slice(1)}
                </Label>
              </div>
            ))}
          </RadioGroup>

          <div className="my-4">
            <Label className="text-sm font-medium">Profile Photo</Label>

            <Input
              type="file"
              accept="image/*"
              onChange={changeFileHandler}
              className="text-sm file:rounded-md file:border file:border-gray-300 file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 cursor-pointe"
            />
          </div>

          <Button type="submit" className="w-full my-4" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please wait
              </>
            ) : (
              "Signup"
            )}
          </Button>

          <span className="text-sm text-center flex justify-center">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-600">
              Login
            </Link>
          </span>
        </form>
      </div>
    </div>
  );
};

export default Signup;
