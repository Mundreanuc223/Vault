import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import './Profile.css';
import Navbar from '../HomeHeader/HomeHeader';
import { FaUserCircle } from "react-icons/fa";
import { BsGrid3X3 } from "react-icons/bs";
import { IoIosStarOutline } from "react-icons/io";

const Profile = () => {
    const { profileUsername } = useParams();
    const [currentUser, setCurrentUser] = useState('');
    const [postCount, setPostCount] = useState(0);
    const [followerCount, setFollowerCount] = useState(0);
    const [followingCount, setFollowingCount] = useState(0);
    const [bio, setBio] = useState('');
    const [isFollowing, setIsFollowing] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [selectedTab, setSelectedTab] = useState('capsules');
    const [capsulePosts, setCapsulePosts] = useState([]);
    const [regularPosts, setRegularPosts] = useState([]);
    const navigate = useNavigate();

    // Fetch session user
    useEffect(() => {
        const fetchSessionUser = async () => {
            try {
                const response = await fetch('http://127.0.0.1:5000/session-user', {
                    credentials: 'include',
                });
                if (response.ok) {
                    const data = await response.json();
                    setCurrentUser(data.username);
                } else {
                    setErrorMessage('Failed to load user info');
                }
            } catch (error) {
                console.error("Failed to fetch session user:", error);
                setErrorMessage('An error occurred while fetching user data.');
            }
        };
        fetchSessionUser();
    }, []);

    // Fetch profile data
    useEffect(() => {
        const fetchProfileData = async () => {
            if (!profileUsername) return;
            try {
                const response = await fetch(`http://127.0.0.1:5000/users/${profileUsername}`, {
                    credentials: 'include',
                });
                if (response.ok) {
                    const data = await response.json();
                    setPostCount(data.post_count);
                    setFollowerCount(data.follower_count);
                    setFollowingCount(data.following_count);
                    setBio(data.bio);
                    setIsFollowing(data.is_following);
                } else {
                    setErrorMessage('Failed to load profile data');
                }
            } catch (error) {
                console.error("Error fetching profile data:", error);
                setErrorMessage("Error fetching profile data");
            }
        };
        fetchProfileData();
    }, [profileUsername]);

    // Fetch time capsule posts for session user
    useEffect(() => {
        const fetchUserCapsules = async () => {
            try {
                const response = await fetch('http://127.0.0.1:5000/user-capsules', {
                    credentials: 'include',
                });
                if (response.ok) {
                    const data = await response.json();
                    setCapsulePosts(data);
                } else {
                    console.error("Failed to load capsule posts");
                }
            } catch (error) {
                console.error("Error fetching capsule posts:", error);
            }
        };
        fetchUserCapsules();
    }, []);

    // Fetch regular posts for profile user
    useEffect(() => {
        const fetchUserPosts = async () => {
            try {
                const response = await fetch(`http://127.0.0.1:5000/posts?username=${profileUsername}`, {
                    credentials: 'include',
                });
                if (response.ok) {
                    const data = await response.json();
                    setRegularPosts(data);
                } else {
                    console.error("Failed to load regular posts");
                }
            } catch (error) {
                console.error("Error fetching regular posts:", error);
            }
        };        
        fetchUserPosts();
    }, [profileUsername]);

    const toggleFollow = async () => {
        try {
            const response = await fetch(`http://127.0.0.1:5000/follow/${profileUsername}`, {
                method: isFollowing ? 'DELETE' : 'POST',
                credentials: 'include',
            });
            if (response.ok) {
                setIsFollowing(!isFollowing);
                if (!isFollowing) {
                    setFollowerCount(followerCount + 1);
                } else {
                    setFollowerCount(followerCount - 1);
                }
            } else {
                console.error("Failed to update follow status");
            }
        } catch (error) {
            console.error("An error occurred:", error);
        }
    };

    const handleTabClick = (tab) => {
        setSelectedTab(tab);
    };

    return (
        <div>
            <Navbar />
            <div className="profile">
                <div className="profile-avatar">
                    <FaUserCircle />
                </div>
                <div className="profile-info">
                    <h2>{profileUsername || errorMessage}</h2>
                    <div className="profile-stats">
                        <span>{postCount} posts</span>
                        <span>{followerCount} followers</span>
                        <span>{followingCount} following</span>
                    </div>
                    <p>{bio}</p>
                    {currentUser === profileUsername ? (
                        <button className="edit-profile-button" onClick={() => navigate('/edit-profile')}>
                            Edit Profile
                        </button>
                    ) : (
                        <button className="follow-button" onClick={toggleFollow}>
                            {isFollowing ? 'Unfollow' : 'Follow'}
                        </button>
                    )}
                </div>

                <div className="profile-tab-navbar">
                    <button
                        className={selectedTab === "capsules" ? "active-profile-tab" : ""}
                        onClick={() => handleTabClick("capsules")}
                    >
                        <img src="/capsule.png" className="capsule-icon" alt="Capsules" width="24" height="24" />
                    </button>
                    <button
                        className={selectedTab === "posts" ? "active-profile-tab" : ""}
                        onClick={() => handleTabClick("posts")}
                    >
                        <BsGrid3X3 size={22}/>
                    </button>
                    <button
                        className={selectedTab === "favorites" ? "active-profile-tab" : ""}
                        onClick={() => handleTabClick("favorites")}
                    >
                        <IoIosStarOutline size={30}/>
                    </button>
                </div>

                <div className="profile-content">
                    {selectedTab === "capsules" && (
                        <div className="capsules-tab popup-style">
                            <h3>Capsules Content</h3>
                            {capsulePosts.length > 0 ? (
                                <div className="capsule-posts">
                                    {capsulePosts.map((post) => (
                                        <div key={post.post_id} className="capsule-post">
                                            <img src={post.image_url} alt="Capsule content" className="capsule-image" />
                                            <p>{post.content}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p>No capsules available to open yet.</p>
                            )}
                        </div>
                    )}

                    {selectedTab === "posts" && (
                         <div className="posts-tab post-content">
                            <h3>Posts Content</h3>
                            {regularPosts.length > 0 ? (
                                <div className="regular-posts">
                                    {regularPosts.map((post) => (
                                        <div key={post.post_id} className="post">
                                            <img src={post.image_url} alt="Post content" className="post-image" />
                                            <p>{post.content}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p>No posts available.</p>
                            )}
                        </div>
                    )}

                    {selectedTab === "favorites" && (
                        <div className="favorites-tab">
                            <h3>Favorites Content</h3>
                            <p>Show all favorites here.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;
