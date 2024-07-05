import { useSelector, useDispatch } from "react-redux";
import { useEffect, useRef, useState } from "react";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { app } from "../firebase.js";
import {
  updateUserStart,
  updateUserSuccess,
  updateUserFailure,
  deleteFailure,
  deleteUserStart,
  deleteUserSuccess,
  signOutStart,
  signInFailure,
  signOutFailure,
  signOutSuccess,
} from "../redux/user/userSlice.js";

function Profile() {
  const fileRef = useRef(null);
  const { currentUser, loading, error } = useSelector((state) => state.user);
  const [file, setFile] = useState(undefined);
  const [filePercentage, SetFilePercentage] = useState(0);
  const [fileUploadError, setFileUploadError] = useState(false);
  const [fileSizeError, setFileSizeError] = useState(false);
  const [formData, setFormData] = useState({});
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const dispatch = useDispatch();
  // => LOGS
  // console.log(formData);
  // console.log(filePercentage);
  // console.log(fileUploadError);
  // => run the handleFileUpload func if there is any change in file
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
  // => handle Changes in form
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };
  // => handle update form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      dispatch(updateUserStart());
      const res = await fetch(`/api/user/update/${currentUser._id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success == false) {
        dispatch(updateUserFailure(data.message));
        return;
      }

      dispatch(updateUserSuccess(data));
      setUpdateSuccess(true);
    } catch (error) {
      dispatch(updateUserFailure(error.message));
    }
  };

  const handleDeleteUser = async () => {
    try {
      dispatch(deleteUserStart());
      const res = await fetch(`/api/user/delete/${currentUser._id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data === false) {
        dispatch(deleteFailure(data.message));
        return;
      }
      dispatch(deleteUserSuccess(data));
    } catch (error) {
      dispatch(deleteFailure(error.message));
    }
  };

  const handleSignOut = async () => {
    try {
      dispatch(signOutStart());
      const res = await fetch("/api/auth/signout"); //=> in this case we senfing get request, get request is the default request so we do not need to mention this
      const data = res.json();
      if (data.success === false) {
        dispatch(signOutFailure(data.message));
        return;
      }
      dispatch(signOutSuccess(data));
    } catch (error) {
      dispatch(signOutFailure(data.message));
    }
  };

  return (
    <div
      className="p-3 max-w-lg mx-auto
    "
    >
      <h1 className="text-3xl font-semibold text-center my-7">Profile</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
            <span className="text-slate-700 font-bold">
              {`Uploading ${filePercentage}%.....`}
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
          defaultValue={currentUser.username}
          id="username"
          className="border p-3 rounded-lg"
          onChange={handleChange}
        />
        <input
          type="email"
          placeholder="email"
          defaultValue={currentUser.email}
          id="email"
          className="border p-3 rounded-lg"
          onChange={handleChange}
        />
        <input
          type="password"
          placeholder="password"
          id="password"
          className="border p-3 rounded-lg"
        />
        <button
          disabled={loading}
          className="bg-slate-700 text-white rounded-lg p-3 uppercase hover:opacity-95 disabled:opacity-75"
        >
          {loading ? "Loading" : "Update"}
        </button>
      </form>

      <div className="flex justify-between mt-5">
        <span
          onClick={handleDeleteUser}
          className="text-red-700 cursor-pointer"
        >
          Delete account
        </span>
        <span onClick={handleSignOut} className="text-red-700 cursor-pointer">
          Signout{" "}
        </span>
      </div>
      <p className="text-red-700 font-bold">{error ? error : ""}</p>
      <p className="text-green-700 font-bold">
        {updateSuccess ? "Success in updating profile" : ""}
      </p>
    </div>
  );
}

export default Profile;
