var http = require("http");
var hostname = "127.0.0.1";
var port = 8080;

const server = http.createServer(function (req, res) {
	const path = req.url;
	const method = req.method;
	if (path === "/products") {
		if (method === "GET") {
			res.writeHead(200, { "Content-Type": "application/json" });
			const products = JSON.stringify([{ name: "농구공", price: 5000 }]);
			res.end(products);
		} else if (method === "POST") {
			// 상품을 생성할떄 많이쓰임
			res.end("생성되었습니다.");
		}
	}
	res.end("good bye");
});

server.listen(port, hostname);

console.log("mall server on");
