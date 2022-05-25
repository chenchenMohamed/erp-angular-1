import { Component, OnInit } from '@angular/core';
import { InformationsService } from 'src/app/services/informations.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { FonctionPartagesService } from 'src/app/services/fonction-partages.service';
import { UtiliteService } from 'src/app/services/utilite.service';
import { SousFamilleService } from 'src/app/services/serviceBD_Commerce/sousFamille.service';

@Component({
  selector: 'app-list-sous-familles',
  templateUrl: './list-sous-familles.component.html',
  styleUrls: ['./list-sous-familles.component.scss']
})
export class ListSousFamillesComponent implements OnInit {
  formC:FormGroup

  isOpenModalDelete = false
  idDeleteModal = ""
  params1Delete = ""
  params2Delete = ""


  constructor(
    private sousFamilleSer : SousFamilleService,
    private utilite:UtiliteService, 
    private fonctionPartagesService:FonctionPartagesService, 
    private fb:FormBuilder, 
    private router:Router, 
    public informationGenerale: InformationsService) {
   
    this.formC = this.fb.group({
      libelle:[''],
      limit:10
    })

    this.getSousFamilles()

  }
  gotToAdd(){
    this.router.navigate(['variable/sousFamilles/ajout']);
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
    limit: 10,
    page:1,
    societe:""
  } 

  oldRequest = { 
    search:{
      libelle:""      
    },
    orderBy:{ 
      libelle:0
    },
    limit: 10,
    page:1,
    societe:""
  }

  ngOnInit(): void {
  }
  
  deleteItem(){
     
    if (this.isLoading) {
      return
    }

    this.isLoading = true
    this.sousFamilleSer.delete(this.idDeleteModal)
    .subscribe(
      res => {
        this.isLoading = false
        let resultat: any = res
        if (resultat.status) {
            this.getSousFamilles()
            this.closeModalDelete()
         }
      },
      error => {
        this.isLoading = false
        alert("Désole, ilya un problème de connexion internet")
      });

  }

  openModalDelete(id, params2){
    this.idDeleteModal = id
    this.isOpenModalDelete = true
    this.params1Delete = "La sous Famille"
    this.params2Delete = params2
  }

  closeModalDelete(){
    this.isOpenModalDelete = false
  }
  isLoading = false

  sousFamilles = []

  getSousFamilles() {

    if (this.isLoading) {
      return
    }

    for(let key in this.request.search){
      this.request.search[key] = this.formC.value[key]
    }
    
    this.request.limit = this.formC.value.limit
    this.request.societe = this.informationGenerale.idSocieteCurrent   

    if(!this.testSyncronisation(this.request, this.oldRequest)){
      this.request.page = 1
    }

    this.isLoading = true
    this.sousFamilleSer.getAll(this.request)
    .subscribe(
      res => {
        this.isLoading = false
        let resultat: any = res
        if (resultat.status) {
          this.sousFamilles = resultat.resultat.docs
          this.totalPage = resultat.resultat.pages
          this.oldRequest = resultat.request
          if(this.totalPage < this.request.page && this.request.page != 1){
            this.request.page = this.totalPage 
            this.getSousFamilles()
          }

          if(!this.testSyncronisation(this.request, resultat.request) || (this.request.page != resultat.request.page) ){
            this.getSousFamilles()
          }
        }
      },
      error => {
        this.isLoading = false
        alert("Désole, ilya un problème de connexion internet")
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
    this.getSousFamilles()
  }

  setPage(newPage: number) {
    this.request.page = newPage
    this.getSousFamilles()
  }

  titreFile = "Liste de sous famille"
  nameFile = "liste_sous_famille"
  printout() {
    this.utilite.printout(this.sousFamilles, this.items, this.titreFile)
  }

  generatePDF() {
    this.utilite.generatePDF(this.sousFamilles, this.items, this.titreFile, this.nameFile)
  }
  
  exportexcel() {
    /* table id is passed over here */
    this.utilite.exportexcel(this.sousFamilles, this.items, this.titreFile, this.nameFile)
  }

  //open modal ajout Element
  isOpenModalAjoutElement = false
  idAjoutElementModal = ""
  typeElement
  
  closeModalAjoutElement(){
    this.isOpenModalAjoutElement = false
    this.getSousFamilles()
  }
  
  openModalAjout(){
    this.typeElement = this.fonctionPartagesService.titreOfModal.ajouterSousFamille
    this.isOpenModalAjoutElement = true
  }

  openModalModifier(id){
    this.idAjoutElementModal = id
    this.typeElement = this.fonctionPartagesService.titreOfModal.modifierSousFamille
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
    
    this.getSousFamilles()
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
