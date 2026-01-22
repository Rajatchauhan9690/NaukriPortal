import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { setAllJobs } from "@/redux/jobSlice";
import { JOB_API_END_POINT } from "@/utils/constant";

const useGetAllJobs = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((store) => store.auth);
  const { searchJobByText } = useSelector((store) => store.job);

  useEffect(() => {
    const fetchAllJobs = async () => {
      // ✅ Only fetch if user is logged in
      if (!user) {
        dispatch(setAllJobs([])); // clear jobs
        return;
      }

      try {
        const res = await axios.get(
          `${JOB_API_END_POINT}/get?keyword=${searchJobByText}`,
          { withCredentials: true }, // include cookies if needed
        );
        dispatch(setAllJobs(res.data.jobs));
      } catch (error) {
        console.log("Error fetching jobs:", error.message); // optional, won't spam console
        dispatch(setAllJobs([])); // clear jobs on error
      }
    };

    fetchAllJobs();
  }, [user, dispatch, searchJobByText]);
};

export default useGetAllJobs;
