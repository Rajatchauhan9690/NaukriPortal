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
import { setLoading, setUser } from "@/redux/authSlice";
import { Loader2 } from "lucide-react";

const Login = () => {
  const [input, setInput] = useState({ email: "", password: "", role: "" });
  const { loading, user } = useSelector((store) => store.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const changeEventHandler = (e) => {
    setInput({ ...input, [e.target.name]: e.target.value });
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    if (!input.email) return toast.error("Email is required");
    if (!input.password) return toast.error("Password is required");
    if (!input.role) return toast.error("Please select a role");

    try {
      dispatch(setLoading(true));

      const res = await axios.post(`${USER_API_END_POINT}/login`, input, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });

      dispatch(setUser(res.data.user));
      toast.success(res.data.message);
      navigate("/");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Login failed");
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
          className="w-[40%] border border-gray-200 rounded-md p-4 my-10"
        >
          <h1 className="font-bold text-xl mb-5 text-center">Login</h1>

          <div className="my-2">
            <Label>Email</Label>
            <Input
              type="email"
              name="email"
              value={input.email}
              onChange={changeEventHandler}
              placeholder="example@gmail.com"
            />
          </div>

          <div className="my-2">
            <Label>Password</Label>
            <Input
              type="password"
              name="password"
              value={input.password}
              onChange={changeEventHandler}
              placeholder="********"
            />
          </div>

          <RadioGroup className="flex items-center gap-4 my-5">
            {["student", "recruiter"].map((roleType) => (
              <div key={roleType} className="flex items-center space-x-2">
                <Input
                  type="radio"
                  id={roleType}
                  name="role"
                  value={roleType}
                  checked={input.role === roleType}
                  onChange={changeEventHandler}
                />
                <Label htmlFor={roleType}>
                  {roleType.charAt(0).toUpperCase() + roleType.slice(1)}
                </Label>
              </div>
            ))}
          </RadioGroup>

          <Button type="submit" className="w-full my-4" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please wait
              </>
            ) : (
              "Login"
            )}
          </Button>

          <span className="text-sm text-center flex justify-center">
            Don't have an account?{" "}
            <Link to="/signup" className="text-blue-600">
              Signup
            </Link>
          </span>
        </form>
      </div>
    </div>
  );
};

export default Login;
