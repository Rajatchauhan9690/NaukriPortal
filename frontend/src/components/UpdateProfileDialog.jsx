import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "./ui/dialog";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Loader2 } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { USER_API_END_POINT } from "@/utils/constant";
import { setUser } from "@/redux/authSlice";
import { toast } from "sonner";

const UpdateProfileDialog = ({ open, setOpen }) => {
  const { user } = useSelector((store) => store.auth);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  const [input, setInput] = useState({
    fullname: "",
    email: "",
    phoneNumber: "",
    bio: "",
    skills: "",
    file: null,
  });

  const [resumeUrl, setResumeUrl] = useState(null);
  const [resumeOriginalName, setResumeOriginalName] = useState(null);

  useEffect(() => {
    if (user) {
      setInput({
        fullname: user.fullname || "",
        email: user.email || "",
        phoneNumber: user.phoneNumber || "",
        bio: user.profile?.bio || "",
        skills: user.profile?.skills?.join(", ") || "",
        file: null,
      });
      setResumeUrl(user.profile?.resume || null);
      setResumeOriginalName(user.profile?.resumeOriginalName || null);
    }
  }, [user]);

  const changeHandler = (e) => {
    setInput({ ...input, [e.target.name]: e.target.value });
  };

  const fileHandler = (e) => {
    const file = e.target.files?.[0];
    if (file) setInput({ ...input, file });
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    Object.entries(input).forEach(([key, value]) => {
      if (key !== "file") formData.append(key, value || "");
    });

    if (input.file) formData.append("file", input.file);

    try {
      setLoading(true);
      const res = await axios.post(
        `${USER_API_END_POINT}/profile/update`,
        formData,
        { withCredentials: true },
      );

      if (res.data.success) {
        dispatch(setUser(res.data.user));
        toast.success(res.data.message);
        setOpen(false);
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Error updating profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Update Profile</DialogTitle>
          <DialogDescription>
            Update your personal details, skills and resume.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submitHandler}>
          <div className="space-y-4">
            <Input
              name="fullname"
              value={input.fullname}
              onChange={changeHandler}
              placeholder="Full Name"
            />
            <Input
              name="email"
              value={input.email}
              onChange={changeHandler}
              placeholder="Email"
            />
            <Input
              name="phoneNumber"
              value={input.phoneNumber}
              onChange={changeHandler}
              placeholder="Phone"
            />
            <Input
              name="bio"
              value={input.bio}
              onChange={changeHandler}
              placeholder="Bio"
            />

            {/* Skills */}
            <Input
              name="skills"
              value={input.skills}
              onChange={changeHandler}
              placeholder="Skills (comma separated)"
            />

            <div className="flex flex-wrap gap-2">
              {input.skills
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean)
                .map((skill, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 text-sm rounded-full border border-blue-500 bg-blue-100 text-blue-700"
                  >
                    {skill}
                  </span>
                ))}
            </div>

            {/* Resume */}
            <Input
              type="file"
              accept="application/pdf"
              onChange={fileHandler}
            />

            {resumeUrl && !input.file && (
              <a href={resumeUrl} target="_blank" rel="noopener noreferrer">
                {resumeOriginalName || "View Resume"}
              </a>
            )}
          </div>

          <DialogFooter className="mt-4">
            <Button className="w-full" disabled={loading}>
              {loading ? <Loader2 className="animate-spin" /> : "Update"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateProfileDialog;
