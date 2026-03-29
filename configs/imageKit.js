import ImageKit from "imagekit";

var imageKit = new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: process.env.go.IMAGEKIT_URL_ENDPOINT
});

export default ImageKit;