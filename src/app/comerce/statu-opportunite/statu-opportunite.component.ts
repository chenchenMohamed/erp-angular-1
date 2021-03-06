import { Component, OnInit } from '@angular/core';
import { InformationsService } from 'src/app/services/informations.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { UtiliteService } from 'src/app/services/utilite.service';
import { FonctionPartagesService } from 'src/app/services/fonction-partages.service';
import { StatuOpportuniteService } from 'src/app/services/serviceBD_Commerce/statuOpportunite.service';

@Component({
  selector: 'app-statu-opportunite',
  templateUrl: './statu-opportunite.component.html',
  styleUrls: ['./statu-opportunite.component.scss']
})
export class StatuOpportuniteComponent implements OnInit {

  modalReference: NgbModalRef;
  
  formC:FormGroup

  isOpenModalDelete = false
  idDeleteModal = ""
  params1Delete = ""
  params2Delete = ""

  closeResult = '';
  constructor(
    private statuOpSer : StatuOpportuniteService,
    private fb:FormBuilder, 
     public informationGenerale: InformationsService,
     private utilite:UtiliteService, private fonctionPartagesService:FonctionPartagesService,
   ) {
   
    this.formC = this.fb.group({
      libelle:[''],
      limit:10
    })
    this.getStatuOpportunites()
  }

  objectKeys = Object.keys;

  items = { 
    libelle:"Libelle"
  };

  itemsVariable = { 
    libelle:"active"
  };

  request = { 
    search:{
      libelle:"" 
    },
    orderBy:{ 
      libelle:0
    },
    societe:this.informationGenerale.idSocieteCurrent,
    limit: 10,
    page:1,
  } 

  oldRequest = { 
    search:{
      libelle:""      
    },
    orderBy:{ 
      libelle:0
    },
    societe:this.informationGenerale.idSocieteCurrent,
    limit: 10,
    page:1,
  }

  ngOnInit(): void {
  }
  
  deleteItem(){
     
    if (this.isLoading) {
      return
    }

    this.isLoading = true
    this.statuOpSer.delete(this.idDeleteModal)
    .subscribe(
      res => {
        this.isLoading = false
        let resultat: any = res
        if (resultat.status) {
            this.getStatuOpportunites()
            this.closeModalDelete()
         }
      },
      error => {
        this.isLoading = false
        alert("D??sole, ilya un probl??me de connexion internet")
      }); 
  }

  openModalDelete(id, params2){
    this.idDeleteModal = id
    this.isOpenModalDelete = true
    this.params1Delete = "La statu Opportunite"
    this.params2Delete = params2
  }

  closeModalDelete(){
    this.isOpenModalDelete = false
  }

  isLoading = false
  statuOpportunites = []
  getStatuOpportunites() {
    if (this.isLoading) {
      return
    }
    for(let key in this.request.search){
      this.request.search[key] = this.formC.value[key]
    }   
    this.request.limit = this.formC.value.limit
    if(!this.testSyncronisation(this.request, this.oldRequest)){
      this.request.page = 1
    }

    this.isLoading = true
    this.statuOpSer.getAll(this.request)
    .subscribe(
      res => {
        this.isLoading = false
        let resultat: any = res
        if (resultat.status) {
          this.statuOpportunites = resultat.resultat.docs
          this.totalPage = resultat.resultat.pages
          this.oldRequest = resultat.request
          if(this.totalPage < this.request.page && this.request.page != 1){
            this.request.page = this.totalPage 
            this.getStatuOpportunites()
          }
          if(!this.testSyncronisation(this.request, resultat.request) || (this.request.page != resultat.request.page) ){
            this.getStatuOpportunites()
          }
        }
      },
      error => {
        this.isLoading = false
        alert("D??sole, ilya un probl??me de connexion internet")
      }); 
  }

  testSyncronisation(request1, request2){
    for(let key in request1.search){
      if(request1.search[key] != request2.search[key]){
        return false
      }
    }
 
    for(let key in request1.orderBy){
      if(request1.orderBy[key] != request2.orderBy[key]){
        return false
      }
    }
   
    if(request1.limit != request2.limit){
      return false
    }

    return true;
  }

  totalPage = 1
  setLimitPage(newLimitPage: number) {
    this.request.limit = newLimitPage
    this.request.page = 1
    this.getStatuOpportunites()
  }

  setPage(newPage: number) {
    this.request.page = newPage
    this.getStatuOpportunites()
  }

  titreFile = "Liste de statu opportunite"
  nameFile = "liste_statu_opportunite"
  printout() {
    this.utilite.printout(this.statuOpportunites, this.items, this.titreFile)
  }

  generatePDF() {
    this.utilite.generatePDF(this.statuOpportunites, this.items, this.titreFile, this.nameFile)
  }
  
  exportexcel() {
    /* table id is passed over here */
    this.utilite.exportexcel(this.statuOpportunites, this.items, this.titreFile, this.nameFile)
  }

  //open modal ajout Element
  isOpenModalAjoutElement = false
  idAjoutElementModal = ""
  typeElement
  
  closeModalAjoutElement(){
    this.isOpenModalAjoutElement = false
    this.getStatuOpportunites()
  }
  
  openModalAjout(){
    this.typeElement = this.fonctionPartagesService.titreOfModal.ajouterStatuOpportunite
    this.isOpenModalAjoutElement = true
  }

  openModalModifier(id){
    this.idAjoutElementModal = id
    this.typeElement = this.fonctionPartagesService.titreOfModal.modifierStatuOpportunite
    this.isOpenModalAjoutElement = true
  }

  changeCroissante(key){
    var classStyle = key+"-croissante";
    var buttons = document.getElementsByClassName(classStyle);
    if(this.request.orderBy[key] == 1){
      this.request.orderBy[key] = -1
      this.activationCroissante(buttons[0], buttons[1])
    }else{
      this.request.orderBy[key] = 1
      this.activationCroissante(buttons[1], buttons[0])
    }

    for(let varkey in  this.request.orderBy){
      if(key != varkey){
         this.request.orderBy[varkey] = 0
      }
    }
    
    this.getStatuOpportunites()
  }

  activationCroissante(buttons1, buttons2){
    var buttons = document.getElementsByClassName("croissante");
    for(let i = 0; i < buttons.length; i++){
      var classList = buttons[i].getAttribute("class")
      classList = classList.replace("active-buttons-croissante","")
      buttons[i].setAttribute("class", classList) 
    }  
    classList = buttons2.getAttribute("class")
    classList = classList.replace("active-buttons-croissante","")
    classList += " active-buttons-croissante"
    buttons2.setAttribute("class", classList)
  }

  }
