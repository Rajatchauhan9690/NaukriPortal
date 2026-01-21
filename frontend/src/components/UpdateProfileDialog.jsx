import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
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

  const changeEventHandler = (e) => {
    setInput({ ...input, [e.target.name]: e.target.value });
  };

  const fileChangeHandler = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setInput({ ...input, file });
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("fullname", input.fullname);
    formData.append("email", input.email);
    formData.append("phoneNumber", input.phoneNumber);
    formData.append("bio", input.bio);
    formData.append("skills", input.skills);
    if (input.file) formData.append("file", input.file);

    try {
      setLoading(true);
      const res = await axios.post(
        `${USER_API_END_POINT}/profile/update`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        },
      );

      if (res.data.success) {
        dispatch(setUser(res.data.user));
        toast.success(res.data.message);

        // Update resume URL dynamically after upload
        if (res.data.user.profile?.resume) {
          setResumeUrl(res.data.user.profile.resume);
          setResumeOriginalName(res.data.user.profile.resumeOriginalName);
        }

        setOpen(false);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Error updating profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open}>
      <DialogContent
        className="sm:max-w-[425px]"
        onInteractOutside={() => setOpen(false)}
      >
        <DialogHeader>
          <DialogTitle>Update Profile</DialogTitle>
          <DialogDescription>
            Update your details, skills, and resume.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submitHandler} className="space-y-4">
          <Input
            name="fullname"
            value={input.fullname}
            onChange={changeEventHandler}
            placeholder="Full Name"
          />
          <Input
            name="email"
            type="email"
            value={input.email}
            onChange={changeEventHandler}
            placeholder="Email"
          />
          <Input
            name="phoneNumber"
            value={input.phoneNumber}
            onChange={changeEventHandler}
            placeholder="Phone Number"
          />
          <Input
            name="bio"
            value={input.bio}
            onChange={changeEventHandler}
            placeholder="Bio"
          />
          <Input
            name="skills"
            value={input.skills}
            onChange={changeEventHandler}
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

          <Input
            type="file"
            accept="application/pdf"
            onChange={fileChangeHandler}
          />

          {/* Resume link */}
          {resumeUrl && (
            <a
              href={resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline block mt-2"
            >
              {resumeOriginalName || "View Resume"}
            </a>
          )}

          <DialogFooter>
            {loading ? (
              <Button className="w-full my-2">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please wait
              </Button>
            ) : (
              <Button type="submit" className="w-full my-2">
                Update
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateProfileDialog;
