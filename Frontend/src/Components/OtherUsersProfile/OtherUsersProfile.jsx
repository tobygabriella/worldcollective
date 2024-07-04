import React, { useEffect, useState } from "react";
import { useParams} from "react-router-dom";
import ProfileContent from "../ProfileContent/ProfileContent";


const API_KEY = import.meta.env.VITE_BACKEND_ADDRESS;

const OtherUsersProfile = () => {
  const { username } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(`${API_KEY}/users/${username}`);
        if (!response.ok) {
          throw new Error("Failed to fetch user details");
        }

        const data = await response.json();
        setUser(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [username]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

   return <ProfileContent user={user} title="User Listings" />

};

export default OtherUsersProfile;
