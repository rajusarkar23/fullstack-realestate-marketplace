import { useSelector } from "react-redux";
import { useEffect, useRef, useState } from "react";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { app } from "../firebase.js";
// import { useNavigate } from "react-router-dom";

function Profile() {
  const fileRef = useRef(null);
  const { currentUser } = useSelector((state) => state.user);
  const [file, setFile] = useState(undefined);
  const [filePercentage, SetFilePercentage] = useState(0);
  const [fileUploadError, setFileUploadError] = useState(false);
  const [fileSizeError, setFileSizeError] = useState(false);
  const [formData, setFormData] = useState({});
  // const navigate = useNavigate();
  console.log(formData);
  console.log(filePercentage);
  console.log(fileUploadError);

  useEffect(() => {
    if (file) {
      handleFileUpload();
    }
  }, [file]);

  const handleFileUpload = () => {
    const storage = getStorage(app);
    const fileName = new Date().getTime() + file.name;
    const storageRef = ref(storage, fileName);
    const uploadFile = uploadBytesResumable(storageRef, file);

    uploadFile.on(
      "state_changed",
      (snapshot) => {
        const oneMBInBytes = 1024000;
        if (snapshot.totalBytes > oneMBInBytes * 2) {
          uploadFile.pause();
          setFileSizeError(true);
        }
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        SetFilePercentage(Math.round(progress));
        // console.log("Upload is " + progress + "% done");
      },
      (error) => {
        setFileUploadError(true);
      },
      () => {
        getDownloadURL(uploadFile.snapshot.ref).then((downloadURL) =>
          setFormData({ ...formData, avatar: downloadURL })
        );
      }
    );
  };

  return (
    <div
      className="p-3 max-w-lg mx-auto
    "
    >
      <h1 className="text-3xl font-semibold text-center my-7">Profile</h1>

      <form className="flex flex-col gap-4">
        <input
          type="file"
          ref={fileRef}
          hidden
          accept="image/*"
          onClick={() => setFileSizeError(false)}
          onChange={(e) => setFile(e.target.files[0])}
        />

        <img
          src={formData.avatar || currentUser.avatar}
          alt="profile"
          className="rounded-full h-24 w-24 object-cover cursor-pointer self-center mt-2"
          onClick={() => fileRef.current.click()}
        />
        <p className="text-sm self-center">
          {fileUploadError ? (
            <span className="text-red-700">Error while uploading image</span>
          ) : fileSizeError ? (
            <span className="text-red-700">Check image size</span>
          ) : filePercentage > 0 && filePercentage < 100 ? (
            <span className="text-slate-700">
              {`Uploading ${filePercentage}%`}
            </span>
          ) : filePercentage == 100 ? (
            <span className="text-green-700">Image uploaded successfully</span>
          ) : (
            ""
          )}
        </p>
        <input
          type="text"
          placeholder="username"
          id="username"
          className="border p-3 rounded-lg"
        />
        <input
          type="email"
          placeholder="email"
          id="email"
          className="border p-3 rounded-lg"
        />
        <input
          type="password"
          placeholder="password"
          id="password"
          className="border p-3 rounded-lg"
        />
        <button className="bg-slate-700 text-white rounded-lg p-3 uppercase hover:opacity-95 disabled:opacity-75">
          Update
        </button>
      </form>

      <div className="flex justify-between mt-5">
        <span className="text-red-700 cursor-pointer">Delete account</span>
        <span className="text-red-700 cursor-pointer">Signout </span>
      </div>
    </div>
  );
}

export default Profile;
