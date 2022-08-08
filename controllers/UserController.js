class UserController {

    constructor(formIdCreate,formIdUpdate,tableId) {
        this.formEl = document.getElementById(formIdCreate);
        this.formUpdateEl = document.getElementById(formIdUpdate);
        this.tableEl = document.getElementById(tableId);
        

        this.onSubmit();
        this.onEdit();
        this.selectAll();
    };

    onEdit() {

      document.querySelector("#box-user-update .btn-cancel").addEventListener("click", e=>{

      this.showPanelCreate();
    });

    this.formUpdateEl.addEventListener('submit', event=>{

      event.preventDefault();

      let btn = this.formUpdateEl.querySelector("[type=submit]");
        
      btn.disabled = true;

      let values = this.getValues(this.formUpdateEl);

      let index = this.formUpdateEl.dataset.trIndex;

      let tr = this.tableEl.rows[index];

      let userOld =   JSON.parse(tr.dataset.user);

      let result = Object.assign({}, userOld, values); 

      tr.dataset.user = JSON.stringify(result);

        this.showPanelCreate();

        this.getPhoto(this.formUpdateEl).then(
          (content)=>{

            if(!values.photo) {
              result._photo = userOld._photo;
            } else {
              result._photo = content;
            }

        tr.innerHTML = 

              `<td><img src="${result._photo}" alt="User Image" class="img-circle img-sm"></td>
              <td>${result._name}</td>
              <td>${result._email}</td>
              <td>${result._admin ? "SIM" : "NÃO"}</td>
                <td>${result._register}</td>
              <td>
                <button type="button" class="btn btn-primary btn-edit btn-xs btn-flat">Editar</button>
                <button type="button" class="btn btn-danger btn-delete btn-xs btn-flat">Excluir</button>
              </td>
              `
      ;

        this.addEventsTr(tr);

        this.updateCount();
             
              this.formEl.reset();

              btn.disabled = false;

              this.formUpdateEl.reset();

          },
          (e)=>{
            console.error(e);
        })

    });

    }

    onSubmit() {

      this.formEl.addEventListener("submit",event =>{

        event.preventDefault();
       
        let btn = this.formEl.querySelector("[type=submit]");
        
        btn.disabled = true;

        let values = this.getValues(this.formEl);

        if(!values) {
          return false;
        }

        this.getPhoto(this.formEl).then(
            (content)=>{
                values.photo = content;

                this.insert(values);

                this.addline(values);

                this.formEl.reset();

                btn.disabled = false;

            },
            (e)=>{
              console.error(e);
          })

      });

    }

    getPhoto(formEl) {

      return new Promise((resolve, reject)=>{
        
        let fileReader = new FileReader();

              let elements =  [...formEl.elements].filter(item=>{

                  if(item.name === "photo"){

                    return item;

                  }

              })

              let file = elements[0].files[0];

              fileReader.onload = ()=>{

                resolve(fileReader.result);

              }
              
              fileReader.onerror = (e)=>{
                reject(e);
              }

              if(file){
                fileReader.readAsDataURL(file);
              } else {
                resolve("dist/img/avatar.png");
              }
      })

    }


    getValues(formEl) {

        let user = {};
        let isValid = true;

        [...formEl.elements].forEach((fields, index)=>{

          if(['name', 'email', 'password'].indexOf(fields.name) > -1 & !fields.value) {
            fields.parentElement.classList.add("has-error");
            isValid = false;
          }

            if(fields.name == 'gender'){
              if(fields.checked){
                user[fields.name] = fields.value;
              }
            } else if (fields.name == "admin"){
                user[fields.name] = fields.checked;
            } else {
                user[fields.name] = fields.value; 
              }
        
          });

          if(!isValid){
            return false;
          }
      
      return new User(
        user.name,
         user.gender,
          user.birth,
           user.country,
            user.email,
             user.admin,
              user.password,
                user.photo

      );
    }

    getUsersStorage() {

      let users = [];

      if(localStorage.getItem("users")){

        users = JSON.parse(localStorage.getItem("users"));

      }

      return users;

    }

    selectAll() {

      let users = this.getUsersStorage();

      users.forEach(dataUser=>{

        let user = new User();

        user.loadFromJSON(dataUser);

        this.addline(user)

      })

    }

    insert(data){

      let users = this.getUsersStorage();

      users.push(data);

      //sessionStorage.setItem("users", JSON.stringify(users));
      localStorage.setItem("users", JSON.stringify(users));

    }

    
    addline(dataUser) {
  
      let tr = document.createElement("tr");

      tr.dataset.user = JSON.stringify(dataUser);

      tr.innerHTML = 

          `<td><img src="${dataUser.photo}" alt="User Image" class="img-circle img-sm"></td>
           <td>${dataUser.name}</td>
           <td>${dataUser.email}</td>
           <td>${dataUser.admin ? "SIM" : "NÃO"}</td>
            <td>${dataUser.register}</td>
           <td>
             <button type="button" class="btn btn-primary btn-edit btn-xs btn-flat">Editar</button>
             <button type="button" class="btn btn-danger  btn-delete btn-xs btn-flat">Excluir</button>
           </td>
          `

      this.addEventsTr(tr);

      this.tableEl.appendChild(tr);

      this.updateCount();

    }

    addEventsTr(tr) {

      tr.querySelector(".btn-delete").addEventListener('click', e=>{

        if(confirm("Deseja Realmente Excluir??")) {

          tr.remove();

        }
        this.updateCount();
      })

      tr.querySelector(".btn-edit").addEventListener("click", e=>{

        let json = JSON.parse(tr.dataset.user);
      
        this.formUpdateEl.dataset.trIndex = tr.sectionRowIndex

        for(let name in json) {

          let field = this.formUpdateEl.querySelector("[name=" + name.replace("_", "") + "]");
          
          if(field) {

            switch(field.type) {

            case 'file':
            continue;  
            break;

            case 'radio':
              field = this.formUpdateEl.querySelector("[name=" + name.replace("_", "") + "][value=" + json[name]+ "]");
              field.checked = true; 
            break;

            case 'checkbox':
              field.checked = json[name];
            break;

            default:

              field.value = json[name];
            
          }   
        }
      }

        this.formUpdateEl.querySelector(".photo").src = json._photo

        this.showPanelUpdate();
      });
    }

    showPanelCreate(){
      document.querySelector("#box-user-create").style = "display:block";
      document.querySelector("#box-user-update").style = "display:none";
    }

    showPanelUpdate(){
      document.querySelector("#box-user-create").style = "display:none";
      document.querySelector("#box-user-update").style = "display:block";
           
    }

    updateCount() {
    
          let numbersAdmin = 0;
          let numbersUsers = 0;

      [...this.tableEl.children].forEach(tr=>{

        numbersUsers++;

        let user = (JSON.parse(tr.dataset.user));

        if(user._admin) numbersAdmin++;

      });

      document.querySelector("#numbers-users").innerHTML = numbersUsers;
      document.querySelector("#numbers-users-admin").innerHTML = numbersAdmin;

    }

}

