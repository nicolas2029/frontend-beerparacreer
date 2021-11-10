let myMap = new Map();
let mapProduct = new Map();
let mapProductUpdate = new Map();
let myOrders;
let myUser;
let total=0;
let last=0;

let hostName = windows.location.hostname
let protocol = windows.location.protocol

let menuApi = `${protocol}//${hostName}:30001`
let menuAdminApi = `${protocol}//${hostName}:30000`


function updateUserEmailAndPassword() {
    let pwd = document.getElementById("password-change-input").value
    let data = {
        "password":pwd
    }
    fetch(menuAdminApi+"/api/v1/user/password/", {
        //credentials: 'same-origin',
        method: 'PATCH',
        body: JSON.stringify(data),
        headers:{
            'Content-Type': 'application/json'
        }}).then(response => console.log(response))
}


// add product to order

function loadMenuProduct(data) {
    var temp = 
    `<div class="col-lg-6 menu-item">
    <div class="menu-content">
    <button name="button-menu" onclick="addProduct(${data.id}, 1, '${data.img}', '${data.name}', ${data.price}, '${data.description}')">${data.name}</button><span>$${data.price.toFixed(2)}</span>
    </div>
    <div class="menu-ingredients">${data.description}</div>
    </div>`;
    mapProduct.set(data.id, {
        name:`${data.name}`,
        price:data.price
    });
    return temp;
}

function getMenu(url, fn){
    var myInit = {method: 'GET'};
    //headers: myHeaders
    var myRequest = new Request(url, myInit);
    //var myHeaders = myRequest.headers;
    fetch(myRequest).then(res => {
        res.json().then(
        data => {
            if (data.length > 0) {
                var temp = "";
                data.forEach((itemData) => {
                    temp += fn(itemData)
                });
                document.getElementById("menu").innerHTML=`<div class="container">
                <div class="section-title">
                    <h2>Revisa nuestro sabroso <span>Menú</span></h2>
                </div>
                <div class="row menu-container" id="menu-container">
                ${temp}
                </div>
        
                </div>`;
            }
        })
    })
}

function LogOut() {
    document.cookie = "" 
    sessionStorage.clear()
    fetch(menuAdminApi +"/api/v1/user/logout/",{method:"GET"}).then(location.reload())
}

function post(url) {
    var email = document.getElementById('email').value;
    var password = document.getElementById('password').value;
    //http.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    let data = {
        "email":email,
        "password":password
    }
    fetch(url, {
        //credentials: 'same-origin',
        method: 'POST', // or 'PUT'
        body: JSON.stringify(data), // data can be `string` or {object}!
        headers:{
            'Content-Type': 'application/json'
        }
        }).then(response => {
            if (response.ok){
                document.cookie = response.headers.get("Cookie");
                response.json().then(data => {sessionStorage.setItem("authorization",data.token);});
                location.reload();
            }else{
                showError("Credenciales no válidas")
            }
            
        }).catch(err => console.log(err));

}

function caseNotLogin() {
    let temp = `<div class="container">
    <div class="section-title" action="" method="POST">
        <h2><span>Registrar/Logear usuario</span></h2>
        <p>Por favor llena el siguiente formulario y da click en uno de los botones para crear una cuenta nueva o acceder a tu cuenta existente</p>
    </div>
    <form class="php-email-form" action="">
        <div class="form-row">
        <div class="col-lg-4 col-md-6 form-group">
            <input type="email" class="form-control" name="email" id="email" placeholder="Tu Correo Electrónico" oninput="return validar_email(email.value)" data-rule="email" data-msg="Please enter a valid email">
            <span id="email-error">Email no valido</span>
            <div class="validate"></div>
        </div>
        <div class="col-lg-4 col-md-6 form-group">
            <input type="password" class="form-control" name="password" id="password" placeholder="Ingresa una contraseña" oninput="return validar_clave(password.value)" data-msg="Please enter at least 4 chars">
            <span id="password-error">Contraseña no válida</span>
            <div class="validate"></div>
        </div>
        <div class="text-center"><button  type="button" disabled id="button-singup" onclick="post('${menuAdminApi}/api/v1/user/')">Registrar</button></div>
        <div class="text-center"><button type="button" disabled id="button-login" onclick="post('${menuAdminApi}/api/v1/user/login/')">LogIn</button></div>
    </form>
    </div>`
    document.getElementById("book-a-table").innerHTML = temp;
    let x = document.getElementsByName("button-menu");
    x.forEach((a, b,c ) => a.disabled=true)
}

function htmlSectionAccount(){
    document.getElementById("nav-account").innerHTML = `<a href="#account">Mi Usuario</a>`
    document.getElementById("account").innerHTML = `<div class="container">
    <div class="section-title" action="" method="POST">
        <h2><span>Cuenta de Usuario</span></h2>
        <p>Aquí podras cambiar tu contraseña y desconectar tu usuario actual</p>
    </div>
    <form class="php-email-form" action="">
        <div class="form-row">
        <div class="col-lg-4 col-md-6 form-group">
            <input type="password" class="form-control" id="password-change-input" name="password"  placeholder="Ingresa una contraseña" oninput="isChangePasswordValid()">
            <span id="password-change-error">Contraseña no válida</span>
        </div>
        <div class="text-center"><button id="password-change" type="button" disabled onclick="updateUserEmailAndPassword()">Cambiar contraseña</button></div>
    </form>
    </div>
    <div class="container">
    <form class="php-email-form" action="">
    <div class="text-center"><button id="button-logout" type="button" onclick="LogOut()">Cerrar sesion</button></div>
    </form>
    </div>`
}

function caseLogin() {
    sectionMyOrder();
    document.getElementById("li-my-order").innerHTML = `<a href="#gallery">Mi Pedido</a>`;
    document.getElementById("nav-orders").innerHTML = `<a href="#orders">Pedidos Realizados</a>`;
    htmlSectionAccount();
}

async function setMyUser(data){
    myUser = data
    if (myUser.rol_id != null) {
        document.getElementById("nav-admin").innerHTML = `<a href="admin.html">Admin</a>`
    }
} 

function switchCaseSession() {
    var myInit = {method: 'GET'};
    var myRequest = new Request(menuAdminApi+'/api/v1/user/login/', myInit);
    fetch(myRequest).then(res => {
        if (res.ok){
            var temp = `<a href="#menu">Realizar pedido</a>`;
            res.json().then(a =>{
                setMyUser(a).then(console.log(myUser));
                caseLogin();
            })
        }else{
            var temp = `<a href="#book-a-table">Registrarse</a>`
            caseNotLogin()
        }
        document.getElementById("nav-item-session").innerHTML = temp;
    })
}

function validar_email(email){
    let re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    var a = re.test(email);
    if (!a){
        document.getElementById("email-error").innerHTML = "Email no valido";
    }
    else{
        document.getElementById("email-error").innerHTML = "";
    }
    isValid()
}

function isPassword(password) {
    if(password.length >= 8)
    {		
        var mayuscula = false;
        var minuscula = false;
        var numero = false;
        var caracter_raro = false;
        
        for(var i = 0;i<password.length;i++)
        {
            if (mayuscula && minuscula && numero && caracter_raro) {
                return true;
            }
            if(password.charCodeAt(i) >= 65 && password.charCodeAt(i) <= 90)
            {
                mayuscula = true;
            }
            else if(password.charCodeAt(i) >= 97 && password.charCodeAt(i) <= 122)
            {
                minuscula = true;
            }
            else if(password.charCodeAt(i) >= 48 && password.charCodeAt(i) <= 57)
            {
                numero = true;
            }
            else
            {
                caracter_raro = true;
            }
        }
        return mayuscula && minuscula && numero && caracter_raro;
    }
    return false;
}

function isChangePasswordValid(){
    password = document.getElementById("password-change-input").value
    if (isPassword(password)){
        console.log(password)
        document.getElementById("password-change").disabled=false
        document.getElementById("password-change-error").innerHTML = "";
    }else{
        document.getElementById("password-change").disabled=true
        document.getElementById("password-change-error").innerHTML = "Contraseña no valida";
    }
}

function validar_clave(contrasenna){
			if(contrasenna.length >= 8)
			{		
				var mayuscula = false;
				var minuscula = false;
				var numero = false;
				var caracter_raro = false;
				
				for(var i = 0;i<contrasenna.length;i++)
				{
                    if (mayuscula && minuscula && numero && caracter_raro) {
                        document.getElementById("password-error").innerHTML = "";
                    }
					if(contrasenna.charCodeAt(i) >= 65 && contrasenna.charCodeAt(i) <= 90)
					{
						mayuscula = true;
					}
					else if(contrasenna.charCodeAt(i) >= 97 && contrasenna.charCodeAt(i) <= 122)
					{
						minuscula = true;
					}
					else if(contrasenna.charCodeAt(i) >= 48 && contrasenna.charCodeAt(i) <= 57)
					{
						numero = true;
					}
					else
					{
						caracter_raro = true;
					}
				}
                a = mayuscula && minuscula && numero && caracter_raro
                if (!a){
                    document.getElementById("password-error").innerHTML = "Contraseña no válida";
                }else{
                    document.getElementById("password-error").innerHTML = "";
                }
			}else{
                document.getElementById("password-error").innerHTML = "Contraseña no válida";
            }
            isValid()
}

function isValid() {
    if (document.getElementById("password-error").innerHTML === "" && document.getElementById("email-error").innerHTML === "") {
        document.getElementById("button-singup").disabled = false;
        document.getElementById("button-login").disabled = false;
    }else{
        document.getElementById("button-singup").disabled = true;
        document.getElementById("button-login").disabled = true;
}
}
    
function getAll() {
    modal = document.getElementById("myModal");
    getMenu(menuApi+'/api/v1/product/', loadMenuProduct);
    switchCaseSession();
    showNavResponse();
}