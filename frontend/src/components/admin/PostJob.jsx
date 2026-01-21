import React, { useState } from "react";
import Navbar from "../shared/Navbar";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useSelector } from "react-redux";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import axios from "axios";
import { JOB_API_END_POINT } from "@/utils/constant";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

const PostJob = () => {
  const [input, setInput] = useState({
    title: "",
    description: "",
    requirements: "",
    salary: "",
    location: "",
    jobType: "",
    experience: "",
    position: "",
    companyId: "",
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const { companies } = useSelector((store) => store.company);

  const changeEventHandler = (e) => {
    setInput({ ...input, [e.target.name]: e.target.value });
  };

  const selectChangeHandler = (value) => {
    const selectedCompany = companies.find(
      (company) => company.name.toLowerCase() === value,
    );
    setInput({ ...input, companyId: selectedCompany._id });
  };

  // Validation function
  const validate = () => {
    const newErrors = {};

    if (!input.title.trim()) newErrors.title = "Title is required";
    if (!input.description.trim())
      newErrors.description = "Description is required";
    if (!input.requirements.trim())
      newErrors.requirements = "Requirements are required";
    if (!input.salary) newErrors.salary = "Salary is required";
    else if (isNaN(input.salary) || Number(input.salary) <= 0)
      newErrors.salary = "Salary must be a positive number";

    if (!input.location.trim()) newErrors.location = "Location is required";
    if (!input.jobType.trim()) newErrors.jobType = "Job Type is required";
    if (!input.experience) newErrors.experience = "Experience is required";
    else if (isNaN(input.experience) || Number(input.experience) < 0)
      newErrors.experience = "Experience must be a number";

    if (!input.position) newErrors.position = "Number of positions is required";
    else if (isNaN(input.position) || Number(input.position) <= 0)
      newErrors.position = "Position must be a positive number";

    if (!input.companyId) newErrors.companyId = "Please select a company";

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    if (!validate()) return; // stop if validation fails

    try {
      setLoading(true);
      const res = await axios.post(`${JOB_API_END_POINT}/post`, input, {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });
      if (res.data.success) {
        toast.success(res.data.message);
        navigate("/admin/jobs");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="flex items-center justify-center w-screen my-5">
        <form
          onSubmit={submitHandler}
          className="p-8 max-w-4xl border border-gray-200 shadow-lg rounded-md"
        >
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label>Title</Label>
              <Input
                type="text"
                name="title"
                value={input.title}
                onChange={changeEventHandler}
                className="focus-visible:ring-offset-0 focus-visible:ring-0 my-1"
              />
              {errors.title && (
                <p className="text-red-600 text-xs">{errors.title}</p>
              )}
            </div>

            <div>
              <Label>Description</Label>
              <Input
                type="text"
                name="description"
                value={input.description}
                onChange={changeEventHandler}
                className="focus-visible:ring-offset-0 focus-visible:ring-0 my-1"
              />
              {errors.description && (
                <p className="text-red-600 text-xs">{errors.description}</p>
              )}
            </div>

            <div>
              <Label>Requirements</Label>
              <Input
                type="text"
                name="requirements"
                value={input.requirements}
                onChange={changeEventHandler}
                className="focus-visible:ring-offset-0 focus-visible:ring-0 my-1"
              />
              {errors.requirements && (
                <p className="text-red-600 text-xs">{errors.requirements}</p>
              )}
            </div>

            <div>
              <Label>Salary</Label>
              <Input
                type="text"
                name="salary"
                value={input.salary}
                onChange={changeEventHandler}
                className="focus-visible:ring-offset-0 focus-visible:ring-0 my-1"
              />
              {errors.salary && (
                <p className="text-red-600 text-xs">{errors.salary}</p>
              )}
            </div>

            <div>
              <Label>Location</Label>
              <Input
                type="text"
                name="location"
                value={input.location}
                onChange={changeEventHandler}
                className="focus-visible:ring-offset-0 focus-visible:ring-0 my-1"
              />
              {errors.location && (
                <p className="text-red-600 text-xs">{errors.location}</p>
              )}
            </div>

            <div>
              <Label>Job Type</Label>
              <Input
                type="text"
                name="jobType"
                value={input.jobType}
                onChange={changeEventHandler}
                className="focus-visible:ring-offset-0 focus-visible:ring-0 my-1"
              />
              {errors.jobType && (
                <p className="text-red-600 text-xs">{errors.jobType}</p>
              )}
            </div>

            <div>
              <Label>Experience Level (years)</Label>
              <Input
                type="number"
                name="experience"
                value={input.experience}
                onChange={changeEventHandler}
                className="focus-visible:ring-offset-0 focus-visible:ring-0 my-1"
              />
              {errors.experience && (
                <p className="text-red-600 text-xs">{errors.experience}</p>
              )}
            </div>

            <div>
              <Label>No of Positions</Label>
              <Input
                type="number"
                name="position"
                value={input.position}
                onChange={changeEventHandler}
                className="focus-visible:ring-offset-0 focus-visible:ring-0 my-1"
              />
              {errors.position && (
                <p className="text-red-600 text-xs">{errors.position}</p>
              )}
            </div>

            <div className="col-span-2">
              {companies.length > 0 ? (
                <>
                  <Select onValueChange={selectChangeHandler}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select a Company" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {companies.map((company) => (
                          <SelectItem
                            key={company._id}
                            value={company.name.toLowerCase()}
                          >
                            {company.name}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  {errors.companyId && (
                    <p className="text-red-600 text-xs mt-1">
                      {errors.companyId}
                    </p>
                  )}
                </>
              ) : (
                <p className="text-xs text-red-600 font-bold text-center my-3">
                  *Please register a company first before posting a job
                </p>
              )}
            </div>
          </div>

          {loading ? (
            <Button className="w-full my-4">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please wait
            </Button>
          ) : (
            <Button type="submit" className="w-full my-4">
              Post New Job
            </Button>
          )}
        </form>
      </div>
    </div>
  );
};

export default PostJob;
