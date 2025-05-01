import { db } from "../firebase";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import imageCompression from "browser-image-compression";
import { useAuth } from "../contexts/AuthContext";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { setDoc } from "firebase/firestore";
import { Link } from "react-router-dom";

export default function Profile() {
    const { user } = useAuth();
    const [profile, setProfile] = useState({
        displayName: "",
        email: "",
        phone: "",
        address: "",
        photoDataUrl: ""
        //photoURL: ""
    });
    const [newPhoto, setNewPhoto] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            if (!user) return;
            const docRef = doc(db, "users", user.uid);
            const snap = await getDoc(docRef);
            if (snap.exists()) {
                //setProfile(snap.data());
                const data = snap.data();
                setProfile({
                    displayName: data.displayName || "",
                    email: data.email || user.email,
                    phone: data.phone || "",
                    address: data.address || "",
                    //photoURL: data.photoURL || ""
                    photoDataUrl:data.photoDataUrl || ""
                });
            } else {
                // Initialize
                await setDoc(docRef, {
                    displayName: user.displayName || "",
                    email: user.email,
                    phone: "",
                    address: "",
                    //photoURL: user.photoURL || ""
                    photoDataUrl: ""   
                });
                // setProfile({
                //     displayName: user.displayName || "",
                //     email: user.email,
                //     phone: "",
                //     address: "",
                //     photoURL: user.photoURL || ""
                // });
                setProfile({ displayName: user.displayName || "", 
                    email: user.email, 
                    phone: "", 
                    address: "", 
                    photoDataUrl: "" });
            }
            setLoading(false);
        }
        load();
    }, [user]);

    const handleChange = (e) => {
        setProfile({ ...profile, [e.target.name]: e.target.value });
    };

    const handlePhotoChange = (e) => {
        if (e.target.files[0]) setNewPhoto(e.target.files[0]);
    };

    const handleSave = async () => {
        try {
            const docRef = doc(db, "users", user.uid);
            //let updatedURL = profile.photoURL;
            let updatedDataUrl = profile.photoDataUrl;
            // if (newPhoto) {
            //     // 1️⃣ 上传新照片
            //     const picRef = storageRef(storage, `profilePictures/${user.uid}.jpg`);
            //     await uploadBytes(picRef, newPhoto);
            //     updatedURL = await getDownloadURL(picRef);
            // }
            if (newPhoto) {
                // **************** 壓縮並轉 Base64 ****************
                const options = { maxSizeMB: 1, maxWidthOrHeight: 512, useWebWorker: true };
                const compressed = await imageCompression(newPhoto, options);
       
                const dataUrl = await new Promise((res, rej) => {
                  const reader = new FileReader();
                  reader.onload = () => res(reader.result);
                  reader.onerror = rej;
                  reader.readAsDataURL(compressed);
                });
               updatedDataUrl = dataUrl;                   // << 更新 Base64 變數
              }

            // 2️⃣ 写到 Firestore
            await updateDoc(docRef, {
                displayName: profile.displayName || "",
                phone: profile.phone || "",
                address: profile.address || "",
                //photoURL: updatedURL || ""
                photoDataUrl: updatedDataUrl
            });

            // 3️⃣ 更新本地 state & 清除 newPhoto
            setProfile((prev) => ({
                ...prev,
                photoURL: updatedDataUrl
            }));
            setNewPhoto(null);

            alert("Profile updated");
        } catch (e) {
            console.error("❌ handleSave failed:", e.code, e.message);
            alert(`Save failed: ${e.message}`);
        }
    };

    if (loading) return <p>Loading...</p>;

    return (
        <div className="container p-4" style={{ maxWidth: 600 }}>
            {/* ← 在这里，return 第一个元素后，插入「< Back to Chatroom」按钮 */}
            <div className="mb-3">
                <Link to="/" className="btn btn-outline-secondary">
                    &lt; Back to Chatroom
                </Link>
            </div>            <h3>My Profile</h3>
            <div className="mb-3 text-center">
                {/* 圓形頭像框 */}
                <div
                    style={{
                        width: 120,
                        height: 120,
                        margin: "0 auto",
                        border: "2px solid #ccc",
                        borderRadius: "50%",
                        overflow: "hidden",
                        position: "relative"
                    }}
                >
                    {(newPhoto || profile.photoDataUrl) ? (
                        <img
                            src={
                                newPhoto
                                    ? URL.createObjectURL(newPhoto)
                                    : profile.photoDataUrl
                            }
                            alt="avatar"
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                    ) : (
                        <span
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                width: "100%",
                                height: "100%",
                                fontSize: "2rem",
                                color: "#aaa"
                            }}
                        >
                            👤
                        </span>
                    )}
                </div>
                {/* 上傳按鈕 */}
                <div style={{ marginTop: "0.5rem" }}>
                    <input type="file" accept="image/*" onChange={handlePhotoChange} />
                </div>
            </div>

            <div className="mb-2">
                <label>Name</label>
                <input
                    className="form-control"
                    name="displayName"
                    value={profile.displayName}
                    onChange={handleChange}
                />
            </div>
            <div className="mb-2">
                <label>Email</label>
                <input className="form-control" value={profile.email} readOnly />
            </div>
            <div className="mb-2">
                <label>Phone</label>
                <input
                    className="form-control"
                    name="phone"
                    value={profile.phone}
                    onChange={handleChange}
                />
            </div>
            <div className="mb-3">
                <label>Address</label>
                <input
                    className="form-control"
                    name="address"
                    value={profile.address}
                    onChange={handleChange}
                />
            </div>
            <button className="btn btn-success" onClick={handleSave}>Save</button>
        </div>
    );
}