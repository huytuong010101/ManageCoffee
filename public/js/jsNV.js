
//_________________________________________
var socket = io("http://172.20.10.5:80");
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
})
socket.on("AvailableTB",function(data){
	document.getElementById("ChonThucUong").style.display = "block";
	document.getElementById("DanhSachThucUong").style.display = "none";
	document.getElementsByClassName('TBNum')[0].innerText = data;
	checkRows();
})
socket.on("BookSusess",function(){
	document.getElementsByClassName('menu')[0].style.display = "none";
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
	document.getElementById("ChonThucUong").style.display = "none";
	document.getElementById("DanhSachThucUong").style.display = "block";
	document.getElementsByClassName('TBNum')[0].innerText = data.NumTB;
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
	        var NewRow = MyTable.insertRow(-1); 
	        NewRow.insertCell(0).innerHTML = '<span style="color:red;">Tổng cộng</span>'; 
	        NewRow.insertCell(1).innerHTML = "-----";
	        NewRow.insertCell(2).innerHTML = '<span style="color:red;">' + Sum + '</span>';

	    })
//________________________________________
function Add(){
	document.getElementById("ChonThucUong").style.display = "block";
	document.getElementById("DanhSachThucUong").style.display = "none";
	checkRows();
}
function OnLoad(){
	var id = document.getElementById("id").innerText;
	socket.emit("Veri",id);
	
}
function Order(){
	var ListOrder = [];
	var a = document.getElementsByClassName("DaGoi");
	if (a.length == -1){
		alert("Danh sách trống!");
		return 0;
	}
	var b = document.getElementsByClassName("SoLuong");
	for (var j = 0;j < a.length;j++){
		ListOrder.push({Name: a[j].innerText,Num: Number(b[j].value)});	
	}
	var NumTB = document.getElementsByClassName('TBNum')[0].innerText;
	var id = document.getElementById("id").innerText;
	socket.emit("BookTable",{NumTB: NumTB,Id: id,List: ListOrder});
}
function CancelOrder(){

	document.getElementsByClassName('menu')[0].style.display = "none";
	var Parent = document.getElementById("order");
	while(Parent.hasChildNodes())
	{
		Parent.removeChild(Parent.firstChild);
	}
	var Parent = document.getElementById("order");
	while(Parent.hasChildNodes())
	{
		Parent.removeChild(Parent.firstChild);
	}
}
function checkRows(){
	var rows = document.getElementById("order").getElementsByTagName("tr").length;
	if (rows == 0){
		document.getElementsByClassName("btnXong")[0].style.display = "none"
	} else {
		document.getElementsByClassName("btnXong")[0].style.display = "";

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
	            NewRow.insertCell(1).innerHTML = '<input class="SoLuong" type="number" value="1" step="1" min="1">'; 
	            NewRow.insertCell(2).innerHTML = '<a onclick="DelRow(this)">Xóa</a>'; 
	            checkRows();


	        }
	    }
	    function Down(event){
	    	var i = event.parentNode.parentNode.rowIndex;
	    	var Num = document.getElementsByClassName("SoLuong");
	    	Num[i].value = Number(Num[i].value) - 1; 
	    	if (Num[i].value == "0"){
	    		document.getElementById("order").deleteRow(i);
	    	}
	    	checkRows();
	    }

	    var Table = document.getElementsByClassName('tableCF');
	    for (i = 0; i < Table.length;i++){
	    	Table[i].onclick = function(event){

	    		socket.emit("CheckTable",event.target.id);
	    		document.getElementById("ChonThucUong").style.display = "none";
	    		document.getElementById("DanhSachThucUong").style.display = "none";
	    		document.getElementsByClassName('menu')[0].style.display = "inline-grid";

	    	}
	    }
