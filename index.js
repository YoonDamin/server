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
			res.status(500).send("에러가 발생했습니다.");
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
			res.status(400).send("에러 발생");
		});
});

app.post("/products", (req, res) => {
	const body = req.body;
	const { name, description, price, seller, imageUrl } = body;
	if (!name || !description || !price || !seller || !imageUrl) {
		res.status(400).send("모든 필드를 입력해주세요.");
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
			res.status(400).send("상품 업로드에 문제가 발생하였습니다.");
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
			res.status(400).send("상품 조회에 에러가 발생했습니다.");
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
	console.log("그랩의 쇼핑몰 서버가 돌아가고 있습니다.");
	models.sequelize
		.sync()
		.then(() => {
			console.log("db 연결 성공");
		})
		.catch((err) => {
			console.error(err);
			console.log("db 연결 에러");
			process.exit();
		});
});
