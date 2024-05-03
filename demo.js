const obj = {
  avatar: [
    {
      fieldname: "avatar",
      originalname: "kapAvatar.jpg",
      encoding: "7bit",
      mimetype: "image/jpeg",
      destination: "./public/temp",
      filename: "kapAvatar.jpg",
      path: "public/temp/kapAvatar.jpg",
      size: 744962,
    },
  ],
  coverImage: [
    {
      fieldname: "coverImage",
      originalname: "kapCoverImage.jpg",
      encoding: "7bit",
      mimetype: "image/jpeg",
      destination: "./public/temp",
      filename: "kapCoverImage.jpg",
      path: "public/temp/kapCoverImage.jpg",
      size: 351613,
    },
  ],
};

console.log(obj.avatar[0].path);
