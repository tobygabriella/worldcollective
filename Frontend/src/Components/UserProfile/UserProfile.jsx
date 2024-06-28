
import { useAuth } from '../Contexts/AuthContext';
import AppHeader from '../Headers/AppHeader';
import './UserProfile.css';

const UserProfile = () => {
    const { user } = useAuth();


    return (
        <div className="profileContainer">
            <AppHeader />
            <div className="profileInfo">
                <img src={user?.profilePicture || 'default-profile.png'} alt="Profile" className="profilePicture" />
                <div className="userInfo">
                    <h2>{user?.name || 'Name of User'}</h2>
                    <h4>@{user?.username}</h4>
                    <p>Bio: {user?.bio || 'No bio available'}</p>
                </div>
            </div>
        </div>
    );
};

export default UserProfile;
