import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { InformationsService } from 'src/app/services/informations.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ToastNotificationService } from 'src/app/services/toast-notification.service';
import { FctListService } from 'src/app/services/fonctionList/fct-list.service';
import { FnctModelService } from 'src/app/services/fonctionModel/fnct-model.service';
import { OperationPreventif } from 'src/app/model/modelGMAO/operationPreventif.model';
import { OperationPreventifService } from 'src/app/services/serviceBD_GMAO/operation-preventif.service';

@Component({
  selector: 'app-operation-preventif',
  templateUrl: './operation-preventif.component.html',
  styleUrls: ['./operation-preventif.component.scss']
})

export class OperationPreventifComponent implements OnInit {

  formC: FormGroup
  operationPreventif: OperationPreventif;
  objectKeys = Object.keys;

  items = {
    libelle: "active"
  };

  itemsVariable = {
    libelle: "active"
  };

  request = {
    search: {
      libelle: ""
    },
    orderBy: {
      libelle: 0
    },
    societeRacine: this.informationGenerale.idSocieteCurrent,    
    limit: 10,
    page: 1,
  }

  oldRequest = {
    search: {
      libelle: ""
    },
    orderBy: {
      libelle: 0
    },
    societeRacine: this.informationGenerale.idSocieteCurrent,    
    limit: 10,
    page: 1,
  }

  erreurOperationPreventif = {
    libelle: "",
  }

  constructor(private fb: FormBuilder,
    private notificationToast: ToastNotificationService,
    public informationGenerale: InformationsService,
    private fnctModel: FnctModelService,
    private fctList: FctListService,
    private opeSe: OperationPreventifService) {
    this.formC = this.fb.group({
      libelle: [''],
      limit: 10
    })
    this.getOperationPreventifs()
    this.getAllParametres()
  }

  ngOnInit(): void {
  }

  //getAll Operation Preventifs
  isLoading = false
  operationPreventifs = []
  getOperationPreventifs(): void {
    if (this.isLoading) {
      return
    }
    for (let key in this.request.search) {
      this.request.search[key] = this.formC.value[key]
    }
    this.request.limit = this.formC.value.limit
    if (!this.testSyncronisation(this.request, this.oldRequest)) {
      this.request.page = 1
    }
    this.isLoading = true
    this.opeSe.getAll(this.request)
      .subscribe(
        res => {
          this.isLoading = false
          let resultat: any = res
          if (resultat.status) {
            this.operationPreventifs = resultat.resultat.docs
            this.totalPage = resultat.resultat.pages
            this.oldRequest = resultat.request
            if (this.totalPage < this.request.page && this.request.page != 1) {
              this.request.page = this.totalPage
              this.getOperationPreventifs()
            }
            if (!this.testSyncronisation(this.request, resultat.request) || (this.request.page != resultat.request.page)) {
              this.getOperationPreventifs()
            }
          }
        },
        error => {
          this.isLoading = false
          alert("D??sole, ilya un probl??me de connexion internet")
        });
  }

  //Save Operation Preventif
  enregistrerOperationPreventif() {
    if (!this.fnctModel.controleInputs(this.erreurOperationPreventif, this.operationPreventif,this.tabLibelle, 'libelle')) {
      this.notificationToast.showError("Veuillez remplir les champs obligatoires !")
      return
    }
    if (this.isLoading) {
      return
    }
    this.isLoading = true
    this.opeSe.create(this.operationPreventif,this.request)
      .subscribe(
        res => {
          this.isLoading = false
          let resultat: any = res
          if (resultat.status) {
            this.getAllParametres()
            this.getOperationPreventifs()
            this.notificationToast.showSuccess("Votre operationPreventif est bien enregistr??e !")
          }
        },
        error => {
          this.isLoading = false
          alert("D??sole, ilya un probl??me de connexion internet")
        });
    this.JoinAndClose()
  }

  //modifier Operation Preventif
  id = ""
  modifierOperationPreventif() {
    if (!this.fnctModel.controleInputsModifer(this.erreurOperationPreventif, this.operationPreventif,this.tabLibelle)) {
      this.notificationToast.showError("Veuillez remplir les champs obligatoires !")
      return
    }
    if (this.isLoading) {
      return
    }
    this.isLoading = true
    this.opeSe.update(this.id, this.operationPreventif,this.request)
      .subscribe(
        res => {
          this.isLoading = false
          let resultat: any = res
          if (resultat.status) {
            this.getAllParametres()
            this.getOperationPreventifs()
            this.notificationToast.showSuccess("Votre operationPreventif est bien modifi??e !")
          }
        },
        error => {
          this.isLoading = false
          alert("D??sole, ilya un probl??me de connexion internet")
        });
    this.JoinAndClose()
  }

  //pour delete un champs avec POP-Up
  isOpenModalDelete = false
  idDeleteModal = ""
  params1Delete = ""
  params2Delete = ""
  openModalDelete(id, params2) {
    this.idDeleteModal = id
    this.isOpenModalDelete = true
    this.params1Delete = "La operationPreventif"
    this.params2Delete = params2
  }
  deleteItem() {
    if (this.isLoading) {
      return
    }
    this.isLoading = true
    this.opeSe.delete(this.idDeleteModal)
      .subscribe(
        res => {
          this.isLoading = false
          let resultat: any = res
          if (resultat.status) {
            this.getOperationPreventifs()
            this.closeModalDelete()
          }
        },
        error => {
          this.isLoading = false
          alert("D??sole, ilya un probl??me de connexion internet")
        });
  }
  
  //pour fermer POP-Up du supprission
  closeModalDelete() {
    this.isOpenModalDelete = false
  }

  //Get parametre of Operation Preventif
  tabLibelle = []
  allOperationPreventifs = []
  getAllParametres() {
    this.opeSe.parametre(this.informationGenerale.idSocieteCurrent)
      .subscribe(
        res => {
          let resultat: any = res
          if (resultat.status) {
            this.allOperationPreventifs = resultat.operationPreventifs
            for (let item of this.allOperationPreventifs) {
              this.tabLibelle.push(item.libelle)
            }
          }
        },
        error => {
          this.isLoading = false
          alert("D??sole, ilya un probl??me de connexion internet")
        });
  }

  //Controller les champs de saisies
  controleInputs() {
    for (let key in this.erreurOperationPreventif) {
      this.erreurOperationPreventif[key] = ""
    }
    var isValid = true
    for (let key in this.erreurOperationPreventif) {
      if (this.operationPreventif[key] == "") {
        this.erreurOperationPreventif[key] = "Veuillez remplir ce champ"
        isValid = false
      }
    }
    for (let i = 0; i < this.tabLibelle.length; i++) {
      if (this.operationPreventif.libelle == this.tabLibelle[i]) {
        this.erreurOperationPreventif.libelle = "Votre libelle existe d??ja"
        isValid = false
        break;
      }
    }
    return isValid
  }

  //pour rendre chaine to HTML
  printout() {
    return this.fctList.printout()
  }

  //pour rendre chaine to HTML
  getDataToHtml(operationPreventifs) {
    return this.fctList.getDataToHtml(this.operationPreventifs)
  }

  //pour rendre chaine to HTML
  stringToHtml(str) {
    return this.fctList.stringToHtml(str)
  }

  //pour faire attendre 
  wait(ms) {
    this.fctList.wait(ms)
  }

  //pour generer un PDF 
  generatePDF() {
    return this.fctList.generatePDF()
  }

  //pour exporter sous format excel 
  exportexcel() {
    return this.fctList.exportexcel()
  }

  //pour verifier la validit?? de 2 requests 
  testSyncronisation(request1, request2) {
    return this.fctList.testSyncronisation(request1, request2)
  }

  //pour changer croissante des variables
  activationCroissante(buttons1, buttons2) {
    this.fctList.activationCroissante(buttons1, buttons2)
  }

  //pour ouvrir un POP-Up
  open(content) {
    this.operationPreventif = {
      id: "",
      libelle: "",
      societeRacine: this.informationGenerale.idSocieteCurrent, 
    }
    this.fnctModel.open(content)
  }

  //pour modifier un POP-Up
  openModifier(content, contact) {
    this.operationPreventif = contact
    this.fnctModel.openModifier(content, contact)
  }

  //pour fermer un POP-Up
  JoinAndClose() {
    this.fnctModel.JoinAndClose()
  }

  totalPage = 1
  setLimitPage(newLimitPage: number) {
    this.request.limit = newLimitPage
    this.request.page = 1
    this.getOperationPreventifs()
  }

  setPage(newPage: number) {
    this.request.page = newPage
    this.getOperationPreventifs()
  }

  changeCroissante(key) {
    var classStyle = key + "-croissante";
    var buttons = document.getElementsByClassName(classStyle);
    if (this.request.orderBy[key] == 1) {
      this.request.orderBy[key] = -1
      this.activationCroissante(buttons[0], buttons[1])
    } else {
      this.request.orderBy[key] = 1
      this.activationCroissante(buttons[1], buttons[0])
    }

    for (let varkey in this.request.orderBy) {
      if (key != varkey) {
        this.request.orderBy[varkey] = 0
      }
    }
    this.getOperationPreventifs()
  }
}
