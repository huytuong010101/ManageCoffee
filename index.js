//Cai dat SERVER______________
var express = require("express");
var app = express();
var bodyParser = require('body-parser');
var session = require('express-session')
app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));
app.use(express.static("public"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.set("view engine","ejs");
app.set("views","./views");
var server = require("http").Server(app);
var io = require("socket.io")(server);
server.listen(80);
//Gia tien
var Price = [{Name: "Cafe Đen", Pr: 10000},{Name: "Cafe Sữa", Pr: 12000},{Name: "Cafe Sữa SG", Pr: 16000},{Name: "Cafe Rang Xay", Pr: 13000},{Name: "Bạc xỉu", Pr: 15000},{Name: "Cafe nóng", Pr: 20000},{Name: "Sting", Pr: 12000},{Name: "Pepsi", Pr: 10000},{Name: "7 Up", Pr: 12000},{Name: "CocaCola", Pr: 15000},{Name: "Revice", Pr: 15000},{Name: "Nước khoáng", Pr: 15000},{Name: "Sửa chua", Pr: 20000},{Name: "Cam vắt", Pr: 25000}]
//Cai dat danh sach ban_______
var TableBooking = []
for (i = 1;i <= 80;i++){
	TableBooking[i] = {DatBan: false,ThucUong: [],SoLuong: [],DonGia: []};
}
//Danh sach user;
var User = [{Name: "NV_Tưởng",Position: "NV",User: "huytuong010101",Pass: "010101tuonghuy"},{Name: "QL_Tưởng",Position: "QL",User: "abc",Pass: "123"}]
var UserLogin = [{}];
//____________________________
io.on("connection",function(socket){
	socket.Veri = false;
	socket.on("disconnect",function(){
		io.sockets.emit("History",{Name: socket.Name,Content: socket.Name + " vừa thoát" ,Time: GetTime() ,Alert: true})
	})
	socket.on("Veri",function(data){
		var index = UserLogin.findIndex(i => i.Id === data);
		if (index != -1){
			socket.Veri = true;
			socket.Name = UserLogin[index].User; 
			io.sockets.emit("History",{Name: socket.Name,Content: socket.Name + " vừa đăng nhập" ,Time: GetTime() ,Alert: true})
		}

	})
	socket.on("ChangeTable",function(data){
		if (!socket.Veri){
			socket.disconnect(true);
			return 0;	
		} 
		ChangeTable(data.NumTB1,data.NumTB2);
		io.sockets.emit("History",{Name: socket.Name,Content: "Chuyển đối bàn " + data.NumTB1 + " và " + data.NumTB2,Time: GetTime() ,Alert: false})
	})
	socket.on("Pay",function(data){
		if (!socket.Veri){
			socket.disconnect(true);
			return 0;	
		} 
		DonBan(data.NumTB);
		io.sockets.emit("ClearTable",data.NumTB);
		io.sockets.emit("History",{Name: socket.Name,Content: "Bàn " + data.NumTB + " thanh toán " + data.Price ,Time: GetTime() ,Alert: true})
	})
	
	socket.emit("Bookeds",CheckTable());
	socket.on("CheckTable",function(NumTB){
		//console.log(NumTB);
		if (TableBooking[Number(NumTB)].DatBan){
			socket.emit("NotAvailableTB",{NumTB: NumTB, Name: TableBooking[Number(NumTB)].ThucUong, Num: TableBooking[Number(NumTB)].SoLuong, Price: TableBooking[Number(NumTB)].DonGia});
		} else {
			socket.emit("AvailableTB",NumTB);
		}
	})
	socket.on("BookTable",function(data){
		if (!socket.Veri){
			socket.disconnect(true);
			return 0;	
		} 
		var str = " ";
		var NumTB = Number(data.NumTB);
		if (!TableBooking[NumTB].DatBan){
			str = str + "Gọi:";
			TableBooking[NumTB].DatBan = true; 
			io.sockets.emit('Booked', data.NumTB);
			for (i = 0;i < data.List.length;i++){
				TableBooking[NumTB].ThucUong[i] = data.List[i].Name;
				TableBooking[NumTB].SoLuong[i] = data.List[i].Num;
				TableBooking[NumTB].DonGia[i] = XemGia(data.List[i].Name);
				str = str + " " + data.List[i].Num + " " + data.List[i].Name + ",";
			}	
		} else {
			str = str + "Gọi thêm:";
			for (i = 0;i < data.List.length;i++){
				str = str + " " + data.List[i].Num + " " + data.List[i].Name + ",";
				var index = TableBooking[NumTB].ThucUong.indexOf(data.List[i].Name);
				if (index == -1){
					TableBooking[NumTB].ThucUong.push(data.List[i].Name);	
					TableBooking[NumTB].SoLuong.push(data.List[i].Num);
					TableBooking[NumTB].DonGia.push(XemGia(data.List[i].Name));
				} else {
					TableBooking[NumTB].SoLuong[index] += data.List[i].Num;
				}
			}
		}
		io.sockets.emit("ListDrinking",{NumTB: data.NumTB,str: str, Time:  GetTime()});
		io.sockets.emit("History",{Name: socket.Name,Content: "Bàn số " + data.NumTB +  str,Time: GetTime() ,Alert: false})

		//console.log(TableBooking[NumTB]);
		socket.emit("BookSusess");	
	})
})

app.get("/",function(req, res){
	if (req.session.loggin){
		var id = makeId();
		var index = UserLogin.findIndex(i => i.User === req.session.Name);
		if (index == -1){
			UserLogin.push({User: req.session.Name,Id: id});
		} else {
			UserLogin[index].Id = id;
		}
		if (req.session.Position == "NV"){
			res.render("NhanVien",{User: req.session.Name, id: id});
			console.log(UserLogin);
		} else if (req.session.Position == "QL"){
			res.render("QuanLi",{User: req.session.Name, id: id});
		}
	} else {
		res.render("DangNhap",{Note: "Nhập thông tin tài khoản"});	
	}
	
})
app.post("/",function(req, res){
	var Username = req.body.User;
	var Password = req.body.Pass;

	User.forEach(function(data){
		if ((Username == data.User) && (Password == data.Pass)){
			req.session.loggin = true;
			req.session.User = Username;
			req.session.Name = data.Name;
			var id = makeId();
			var index = UserLogin.findIndex(i => i.User === Username);
			if (index == -1){
				UserLogin.push({User: data.Name,Id: id});
			} else {
				UserLogin[index].Id = id;
			}
			if (data.Position == "NV"){
				req.session.Position = "NV";
				res.render("NhanVien",{User: data.Name, id: id});
			} else if (data.Position == "QL"){
				req.session.Position = "QL";
				res.render("QuanLi",{User: data.Name, id: id});
			}
			return;
		}
	})
	if (!req.session.loggin) res.render("DangNhap",{Note: "Nhập sai thông tin"});
})
app.post("/Logout",function(req,res){
	var index = UserLogin.findIndex(i => i.User === req.session.User);;
	if (index != -1){
		UserLogin.splice(index,1);
	}
	req.session.destroy(function(err) {});
	res.render("DangNhap",{Note: "Bạn đã đăng xuất!"});
})
app.get("/nhanvien",function(req,res){
	res.render("NhanVien",{User: "abc", id: "123"});
})
app.get("/nhanvien",function(req,res){
	res.render("Page404");
})
app.get("/phache",function(req,res){
	res.render("PhaChe.ejs");
})
function makeId() {
	var text = "";
	var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	for (var i = 0; i < 5; i++)
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	return text;
}
function XemGia(str){
	if (Price.findIndex(i => i.Name === str) == -1) return 0;
	return Price[Price.findIndex(i => i.Name === str)].Pr
}
function CheckTable(){
	a = [];
	for (i = 1;i <= 80;i++){
		if (TableBooking[i].DatBan){
			a[i] = true;
		} else a[i] = false;
	}
	return a;
}
function DonBan(NumTB){
	TableBooking[NumTB] = {DatBan: false,ThucUong: [],SoLuong: [],DonGia: []};
}
function ChangeTable(a,b){
	var tem = TableBooking[a];
	TableBooking[a] = TableBooking[b];
	TableBooking[b] = tem;
	if (TableBooking[a].DatBan){
		io.sockets.emit('Booked', a);
	} else {
		io.sockets.emit("ClearTable",a);
	}
	if (TableBooking[b].DatBan){
		io.sockets.emit('Booked', b);
	} else {
		io.sockets.emit("ClearTable",b);
	}

}
function GetTime(){
	var a = new Date();
	return a.getDate() + "/" + a.getMonth() + "/" + a.getFullYear() + " " + a.getHours() + ":" + a.getMinutes(); 
}