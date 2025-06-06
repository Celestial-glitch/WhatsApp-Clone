import { useState, useEffect } from "react";
import { FaSearch, FaEllipsisV } from "react-icons/fa";
import { BsChatDotsFill } from "react-icons/bs";
import { MdGroupAdd } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const BASE_URL = "http://localhost:8080";

const ChatListSidebar = ({ onSelectChat }) => {
  const [search, setSearch] = useState("");
  const [chats, setChats] = useState([]);
  const navigate = useNavigate();

useEffect(() => {
  if (search.trim() === "") {
    setChats([]);
    return;
  }

  const fetchSearchResults = async () => {
    try {
      const [userRes, groupRes] = await Promise.all([
        axios.get(`${BASE_URL}/profile/search?name=${search}`),
        axios.get(`${BASE_URL}/api/groups/search?name=${search}`),
      ]);

      const users = await Promise.all(userRes.data.map(async (user) => {
        try {
          const profileResponse = await axios.get(`${BASE_URL}/profile/${user.id}`);
          return {
            ...user,
            type: "user",
            profilePictureUrl: profileResponse.data.profilePictureUrl,
          };
        } catch {
          return {
            ...user,
            type: "user",
            profilePictureUrl: "/default-avatar.jpg",
          };
        }
      }));

      const groups = groupRes.data.map(group => ({
        ...group,
        type: "group",
        profilePictureUrl: group.groupPictureUrl || "/group-avatar.jpeg",
      }));

      setChats([...users, ...groups]);
    } catch (error) {
      console.error("Search error:", error);
    }
  };

  const delayDebounce = setTimeout(fetchSearchResults, 300);
  return () => clearTimeout(delayDebounce);
}, [search]);


  return (
    <div className="w-1/3 h-screen bg-gray-900 text-white flex flex-col pt-7">
      <div className="p-4 flex justify-between items-center border-b border-gray-700">
        <h2 className="text-lg font-semibold">Chats</h2>
        <div className="flex gap-3">
        <MdGroupAdd className="text-xl cursor-pointer"   onClick={() => navigate("/create-group")} />
        
          {/* <FaEllipsisV className="text-xl cursor-pointer" /> */}
        </div>
      </div>

      <div className="p-3">
        <div className="flex items-center bg-gray-800 px-3 py-2 rounded-lg">
          <FaSearch className="text-gray-400" />
          <input
            type="text"
            placeholder="Search"
            className="bg-transparent ml-2 text-white outline-none w-full"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {chats.length === 0 ? (
          <p className="text-center text-gray-400 mt-4">No users found</p>
        ) : (
          chats.map((chat) => (
            <div
              key={chat.id}
              className="flex items-center p-3 border-b border-gray-700 hover:bg-gray-800 cursor-pointer"
              onClick={() => {
                onSelectChat(chat);
                navigate("/chat");
                console.log("Clicked chat:", chat);
                console.log("Profile Picture URL:", chat.profilePictureUrl);
              }}
            >
              {/* Display real profile photo */}
              <img
               src={chat.profilePictureUrl || "/default-avatar.jpg"} 
                alt={chat.name}
                className="w-12 h-12 rounded-full"
                onError={(e) => {
                  console.error("Image load error for:", chat.profilePictureUrl);
                  e.target.src = "/default-avatar.jpg";
                }}
              />
              <div className="ml-3 flex-1">
                <h3 className="text-sm font-semibold">{chat.name}</h3>
                <p className="text-xs text-gray-400 truncate">{chat.lastMessage || "No messages yet"}</p>
              </div>
              <div className="text-xs text-gray-400">
                <span>{chat.time || ""}</span>
                {chat.unread > 0 && (
                  <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs ml-2">
                    {chat.unread}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ChatListSidebar;
