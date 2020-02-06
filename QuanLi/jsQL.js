var socket = io("http://172.20.10.5:80");
function OnLoad(){
	var id = document.getElementById("Id").innerText;
	socket.emit("Veri",id);
	
}
socket.on("History",function(data){
	if (data.Alert){
		$.notify(data.Content, "info");
	}
	var MyTable = document.getElementById("TableLS"); 
	
	var NewRow = MyTable.insertRow(0); 
	NewRow.insertCell(0).innerHTML = data.Name; 
	NewRow.insertCell(1).innerHTML = data.Content;
	NewRow.insertCell(2).innerHTML = data.Time;
})
socket.on("AvailableTB",function(data){
	document.getElementById("GoiMon").style.display = "block";
	document.getElementById("LichSu").style.display = "none";
	document.getElementById("DaGoi").style.display = "none";
	document.getElementById("menu").style.display = "block";
	document.getElementById("ChuyenBan").style.display = "none";
	document.getElementById("NumTB").innerText = data;
	var Parent = document.getElementById("order");
	while(Parent.hasChildNodes())
	{
		Parent.removeChild(Parent.firstChild);
	}
	
	
})
socket.on("NotAvailableTB",function(data){
	var Parent = document.getElementById("TinhTien");
	while(Parent.hasChildNodes())
	{
		Parent.removeChild(Parent.firstChild);
	}
	document.getElementById("GoiMon").style.display = "none";
	document.getElementById("LichSu").style.display = "none";
	document.getElementById("DaGoi").style.display = "block";
	document.getElementById("menu").style.display = "block";
	document.getElementById("ChuyenBan").style.display = "none";
	document.getElementById("NumTB").innerText = data.NumTB;
	var Sum = 0;
	var MyTable = document.getElementById("TinhTien"); 
	for (i = 0;i < data.Name.length;i++){
		

	            // insert new row.
	            Sum += data.Num[i]*data.Price[i];
	            var NewRow = MyTable.insertRow(0); 
	            NewRow.insertCell(0).innerHTML = data.Name[i]; 
	            NewRow.insertCell(1).innerHTML = data.Num[i];
	            NewRow.insertCell(2).innerHTML = data.Price[i];
	            

	            
	            
	        }
	        var NewRow = MyTable.insertRow(0); 
	        NewRow.insertCell(0).innerHTML = '<span style="color:red;">Thức uông</span>'; 
	        NewRow.insertCell(1).innerHTML = '<span style="color:red;">SL</span>';
	        NewRow.insertCell(2).innerHTML = '<span style="color:red;">Đơn giá</span>';
	        var NewRow = MyTable.insertRow(-1); 
	        NewRow.insertCell(0).innerHTML = '<span style="color:red;">Tổng cộng</span>'; 
	        NewRow.insertCell(1).innerHTML = "-----";
	        NewRow.insertCell(2).innerHTML = '<span style="color:red;" id="Sum">' + Sum + '</span>';

	    })
socket.on("Bookeds",function(data){
	for (i = 1;i < data.length;i++){
		if (data[i]){
			document.getElementById(String(i)).style.backgroundColor = "red";
		}
	}
})
socket.on("Booked",function(data){
	document.getElementById(data).style.backgroundColor = "red";
})
socket.on("ClearTable",function(data){
	document.getElementById(String(data)).style.backgroundColor = "white";
	document.getElementById("GoiMon").style.display = "none";
	document.getElementById("LichSu").style.display = "block";
	document.getElementById("DaGoi").style.display = "none";
})
//___________________________________________
function Order(){
	var ListOrder = [];
	var a = document.getElementsByClassName("DaGoi");
	if (a.length == 0){
		$.notify("Danh sách hiện đang trống", "error");
		return 0;
	}
	var b = document.getElementsByClassName("SoLuong");
	for (var j = 0;j < a.length;j++){
		ListOrder.push({Name: a[j].innerText,Num: Number(b[j].value)});	
	}
	var NumTB = document.getElementById("NumTB").innerText;
	
	socket.emit("BookTable",{NumTB: NumTB,List: ListOrder});
	var Parent = document.getElementById("order");
	while(Parent.hasChildNodes())
	{
		Parent.removeChild(Parent.firstChild);
	}	
}
function DelRow(btn){
	var row = btn.parentNode.parentNode;
	row.parentNode.removeChild(row);
	checkRows();
}
var Menu = document.getElementsByClassName('thucUong');
for (i = 0;i < Menu.length;i++){
	Menu[i].onclick = function(event){

		var Name = event.target.innerText;


		var a = document.getElementsByClassName("DaGoi");
		var b = document.getElementsByClassName("SoLuong");

		for (var j = 0;j < a.length;j++){


			if (a[j].innerText == Name){


				b[j].value = Number(b[j].value) + 1;
				return; 
			}
		}

		var MyTable = document.getElementById("order"); 

	            // insert new row.
	            var NewRow = MyTable.insertRow(0); 
	            NewRow.insertCell(0).innerHTML = '<h3 class="DaGoi" onclick="Down(this)">' + Name + '</h3>'; 
	            NewRow.insertCell(1).innerHTML = '<input style="width: 40%;" class="SoLuong" type="number" value="1" step="1" min="1">'; 
	            NewRow.insertCell(2).innerHTML = '<a onclick="DelRow(this)">Xóa</a>'; 
	            


	        }
	    }
	    function Add(){
	    	document.getElementById("GoiMon").style.display = "block";
	    	document.getElementById("LichSu").style.display = "none";
	    	document.getElementById("DaGoi").style.display = "none";
	    	document.getElementById("menu").style.display = "block";
	    	document.getElementById("ChuyenBan").style.display = "none";
	    }
	    function Cancel(){
	    	var Parent = document.getElementById("order");
	    	while(Parent.hasChildNodes())
	    	{
	    		Parent.removeChild(Parent.firstChild);
	    	}
	    	document.getElementById("GoiMon").style.display = "none";
	    	document.getElementById("LichSu").style.display = "block";
	    	document.getElementById("DaGoi").style.display = "none";
	    	document.getElementById("menu").style.display = "block";

	    }
	    function ChangeTable(){
	    	document.getElementById("menu").style.display = "none";
	    	document.getElementById("ChuyenBan").style.display = "block";
	    }
	    function CheckPay(){
	    	socket.emit("CheckTable",document.getElementById("NumTB").innerText);	
	    }
	    function Pay(){
	    	var NumTB = document.getElementById("NumTB").innerText;
	    	var Price = document.getElementById("Sum").innerText;
	    	socket.emit("Pay",{NumTB: Number(NumTB),Price: Number(Price)});
	    }
	    function Print(){
	    	var divToPrint=document.getElementById("TinhTien");
	    	newWin= window.open("");
	    	newWin.document.write("-----Cafe Huy Tưởng-----<br>");
	    	newWin.document.write("--Đại chỉ: Chuồngg heo--<br>");
	    	newWin.document.write("------------------------------<br>");
	    	newWin.document.write(divToPrint.outerHTML);
	    	newWin.document.write("------------------------------<br>");
	    	newWin.document.write("Hẹn gặp lại!");
	    	newWin.print();
	    	newWin.close();
	    }

	    function ChuyenBan(){
	    	NumTB1 = document.getElementById("NumTB").innerText;
	    	NumTB2 = document.getElementById("slct").value;
	    	socket.emit("ChangeTable",{NumTB1: Number(NumTB1),NumTB2: Number(NumTB2)});
	    }
	    var Table = document.getElementsByClassName('tableCF');
	    for (i = 0; i < Table.length;i++){
	    	Table[i].onclick = function(event){

	    		socket.emit("CheckTable",event.target.id);


	    	}
	    }
