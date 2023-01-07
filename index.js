const express = require("express");
const cors = require("cors");
const app = express();
const models = require("./models");
const multer = require("multer");
const upload = multer({
	storage: multer.diskStorage({
		destination: function (req, file, cb) {
			cb(null, "uploads/");
		},
		filename: function (req, file, cb) {
			cb(null, file.originalname);
		},
	}),
});
const port = process.env.port || 8080;

app.use(express.json());
app.use(cors());
app.use("/uploads", express.static("uploads"));

app.get("/banners", (req, res) => {
	models.Banner.findAll({
		limit: 2,
	})
		.then((result) => {
			res.send({
				banners: result,
			});
		})
		.catch((error) => {
			console.log(error);
			res.status(500).send("error!");
		});
});

app.get("/products", (req, res) => {
	models.Product.findAll({
		// db양이 많다면, 반드시 제한을 둬야한다.
		// limit: 1,
		// where :
		order: [["createdAt", "DESC"]],
		// 최신순정렬
		attributes: [
			"id",
			"name",
			"price",
			"createdAt",
			"seller",
			"imageUrl",
			"soldout",
		],
	})
		.then((result) => {
			console.log("PRODUCTS : ", result);
			res.send({
				products: result,
			});
		})
		.catch((err) => {
			consol.error(err);
			res.status(400).send("error!");
		});
});

app.post("/products", (req, res) => {
	const body = req.body;
	const { name, description, price, seller, imageUrl } = body;
	if (!name || !description || !price || !seller || !imageUrl) {
		res.status(400).send("pls input text");
	}
	models.Product.create({
		name: name,
		description: description,
		price: price,
		seller: seller,
		imageUrl: imageUrl,
	})
		.then((result) => {
			console.log("상품 생성 결과 : ", result);
			res.send({
				result,
			});
		})
		.catch((err) => {
			console.error(err);
			res.status(400).send("error");
		});
	// res.send({
	// 	body: body,
	// });
});

app.get("/products/:id", (req, res) => {
	// /:id/events/:eventId 경로 설정가능
	const params = req.params;
	const { id } = params;
	models.Product.findOne({
		where: {
			id: id,
		},
	})
		.then((result) => {
			console.log("PRODUCT : ", result);
			res.send({
				product: result,
			});
		})
		.catch((err) => {
			console.error(err);
			res.status(400).send("error");
		});
});

app.post("/image", upload.single("image"), (req, res) => {
	const file = req.file;
	console.log(file);
	res.send({
		imageUrl: file.path,
	});
});

app.post("/purchase/:id", (req, res) => {
	const { id } = req.params;
	models.Product.update(
		{
			soldout: 1,
		},
		{
			where: {
				// id:id,
				id,
			},
		}
	)
		.then((result) => {
			res.send({
				result: true,
			});
		})
		.catch((error) => {
			res.status(500).send("에러가 발생했습니다.");
		});
});

app.listen(port, () => {
	console.log("server start");
	models.sequelize
		.sync()
		.then(() => {
			console.log("db connect");
		})
		.catch((err) => {
			console.error(err);
			console.log("db connect fail");
			process.exit();
		});
});
