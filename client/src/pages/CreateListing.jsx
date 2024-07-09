import React, { useState } from "react";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { app } from "../firebase.js";

function CreateListing() {
  // => Taking files as array
  const [files, setFiles] = useState([]);
  // => Taking form data as array
  const [formData, setFormData] = useState({
    imageUrls: [],
  });
  // => State to manage imageUpload error
  const [imageUploadError, setImageUploadError] = useState(false);
  // => To get current uploading state
  const [uploading, setUploading] = useState(false);
  // console.log(files);
  console.log(formData);
  // => Handle the image upload
  const handleImageSubmit = (e) => {
    // => Set file length
    if (files.length > 0 && files.length + formData.imageUrls.length < 7) {
      // => Set the uploading state to true
      setUploading(true);
      // => Take an array, promises
      const promises = [];
      // => Loops the files and set the files to promises array
      for (let i = 0; i < files.length; i++) {
        // => Loop through each file and call storeImage func for each file
        promises.push(storeImage(files[i]));
      }
      // => Wait for all the promises in the promises array to resolve
      Promise.all(promises)
        // => Then update the stFormData
        .then((uris) => {
          setFormData({
            ...formData,
            imageUrls: formData.imageUrls.concat(uris),
          });
          // => setImageUploadError(false), setUploading(false);
          setImageUploadError(false);
          setUploading(false);
        })
        // => catch error if any
        .catch((err) => {
          setImageUploadError("Image upload failed please try again");
          setUploading(false);
        });
    }
    // => for else
    else {
      setImageUploadError("Images should be greater than 0 and lesser than 6");
      setUploading(false);
    }
  };

  const storeImage = async (file) => {
    // => return a new Promise, allowing for asynchronous operations (uploading the file and obtaining the URL)
    return new Promise((resolve, reject) => {
      // => Firebase configuration
      const storage = getStorage(app);
      const fileName = new Date().getTime() + file.name;
      const storageRef = ref(storage, fileName);
      const uploadTask = uploadBytesResumable(storageRef, file);
      // => Upload on firebase
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log(`Upload is ${progress}% done`);
        },
        (error) => {
          // => rejects the promise and throw the error.
          reject(error);
        },
        // => Get the download url
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            resolve(downloadURL);
          });
        }
      );
    });
  };
  // => Delete image func
  const handleDeleteImage = (index) => {
    // => allow all imgs except matched id
    setFormData({
      ...formData,
      imageUrls: formData.imageUrls.filter((_, i) => i !== index),
    });
  };

  return (
    <main className="p-3 max-w-4xl mx-auto">
      <h1 className="text-3xl font-semibold text-center my-7">
        Create Listing
      </h1>
      <form className="flex flex-col sm:flex-row gap-4">
        <div className="flex flex-col gap-4 flex-1">
          <input
            type="text"
            placeholder="Name"
            className="border p-3 rounded-lg"
            id="name"
            maxLength="62"
            minLength="10"
            required
          />
          <textarea
            type="text"
            placeholder="Description"
            className="border p-3 rounded-lg"
            id="description"
            required
          />
          <input
            type="text"
            placeholder="Address"
            className="border p-3 rounded-lg"
            id="address"
            required
          />
          <div className="flex gap-6 flex-wrap">
            <div className="flex gap-2">
              <input type="checkbox" id="sell" className="w-5" />
              <span>Sell</span>
            </div>
            <div className="flex gap-2">
              <input type="checkbox" id="rent" className="w-5" />
              <span>Rent</span>
            </div>
            <div className="flex gap-2">
              <input type="checkbox" id="parking" className="w-5" />
              <span>Parking Spot</span>
            </div>
            <div className="flex gap-2">
              <input type="checkbox" id="furnished" className="w-5" />
              <span>Furnished</span>
            </div>
            <div className="flex gap-2">
              <input type="checkbox" id="offer" className="w-5" />
              <span>Offer</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-2">
              <input
                type="number"
                id="bedrooms"
                min="1"
                max="10"
                required
                className="p-3 border-gray-300 rounded-lg"
              />
              <p>Beds</p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                id="baths"
                min="1"
                max="10"
                required
                className="p-3 border-gray-300 rounded-lg"
              />
              <p>Baths</p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                id="regularprice"
                min="1"
                max="10"
                required
                className="p-3 border-gray-300 rounded-lg"
              />
              <div className="flex flex-col items-center">
                <p>Regular Prices</p>
                <span className="text-sm">($/Months)</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                id="discountprice"
                min="1"
                max="10"
                required
                className="p-3 border-gray-300 rounded-lg"
              />
              <div className="flex flex-col items-center">
                <p>Discounted Prices</p>
                <span className="text-sm">($/Month)</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col flex-1 gap-4">
          <p className="font-semibold">
            Images:
            <span className="font-normal text-gray-600 ml-2">
              The first image will be the cover (max 6)
            </span>
          </p>
          <div className="flex gap-4">
            <input
              className="p-3 border border-gray-300 rounded w-full"
              type="file"
              id="images"
              accept="image/*"
              multiple
              onChange={(e) => {
                setFiles(e.target.files), setImageUploadError(false);
              }}
            />
            <button
              className="focus:outline-none text-white bg-purple-700 hover:bg-purple-800 focus:ring-4 focus:ring-purple-300 font-medium rounded-lg text-sm px-5 py-2.5 mb-2 uppercase disabled:opacity-95"
              disabled={uploading}
              type="button"
              onClick={handleImageSubmit}
            >
              {uploading ? "Uploading" : "Upload"}
            </button>
          </div>
          <p className="text-red-700 font-bold">
            {imageUploadError && imageUploadError}
          </p>
          {/* If formdata length greater than 0 map through the urls  */}
          {formData.imageUrls.length > 0 &&
            formData.imageUrls.map((url, index) => (
              <div
                key={url}
                className="flex justify-between p-3 border bg-gray-50 items-center rounded-lg"
              >
                <img
                  src={url}
                  alt="listing-imgs"
                  className="w-20 h-20 object-contain rounded-lg"
                />
                <button
                  type="buttom"
                  onClick={() => handleDeleteImage(index)}
                  className="focus:outline-none text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 uppercase"
                >
                  Delete
                </button>
              </div>
            ))}
          <button className="p-3 bg-slate-700 text-white rounded-lg uppercase hover:opa. disabled:opacity-65">
            Create Listing
          </button>
        </div>
      </form>
    </main>
  );
}

export default CreateListing;
