import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { InformationsService } from 'src/app/services/informations.service';
import { ToastNotificationService } from 'src/app/services/toast-notification.service';
import { FonctionPartagesService } from 'src/app/services/fonction-partages.service';
import { ProjetClient } from 'src/app/model/modelCommerce/projetClient';
import { FnctModelService } from 'src/app/services/fonctionModel/fnct-model.service';
import { ProjetClientService } from 'src/app/services/serviceBD_Commerce/projetClient.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-ajout-projet',
  templateUrl: './ajout-projet.component.html',
  styleUrls: ['./ajout-projet.component.scss']
})
export class AjoutProjetComponent implements OnInit {
  projetFormGroup: FormGroup;

  objectKeys = Object.keys;

  projets = []

  request = new ProjetClient()

  projet = new ProjetClient()

  erreurProjet = {
    libelle: "",
    enCours: "",
    client : "",
    budjet: "",
    totalVente: "",
    totalReglement: "",
  }

  constructor(
    private notificationToast: ToastNotificationService,
    public informationGenerale: InformationsService,
    private fonctionPartagesService: FonctionPartagesService,
    private fnctModel: FnctModelService,
    private projetCliSer: ProjetClientService,
    private router: Router,) { }

  ngOnInit(): void {
    this.getAllParametres()
  }

  isLoading = false
  pageList = "client/projet/list"
  ajoutProjet() {
    if (!this.fnctModel.controleInputs(this.erreurProjet, this.projet, this.tabLibelle, 'libelle')) {
      this.notificationToast.showError("Veuillez remplir les champs obligatoires !")
      return
    }
    if (this.isLoading) {
      return
    }
    this.isLoading = true
    for (let key in this.projet) {
      this.request[key] = this.projet[key]
    } 
    this.request.societe = this.informationGenerale.idSocieteCurrent
    this.projetCliSer.create(this.request)
      .subscribe(
        res => {
          this.isLoading = false
          let resultat: any = res
          if (resultat.status) {
            this.notificationToast.showSuccess("Votre projet est bien enregistr??e !")  
            this.router.navigate([this.pageList]);
          }
        },
        error => {
          this.isLoading = false
          alert("D??sole, ilya un probl??me de connexion internet")
        });
  }
  //Get parametre of Projet Client
  tabLibelle = []
  allProjets = []
  getAllParametres() {
    this.projetCliSer.parametre(this.informationGenerale.idSocieteCurrent)
      .subscribe(
        res => {
          let resultat: any = res
          if (resultat.status) {
            this.clients = resultat.clients
            this.allProjets = resultat.projets
            console.log("this.allProjets",this.allProjets)
            for (let item of this.allProjets) {
              this.tabLibelle.push(item.libelle)
            }
          }
        },
        error => {
          this.isLoading = false
          alert("D??sole, ilya un probl??me de connexion internet")
        });
  }

  clients = []
  //autocomplete client
  keySelectedClient = "raisonSociale"
  objetClient = {
    email: "Email",
    telephone: "T??l??phone",
    code: "Code",
    raisonSociale: "Raison Sociale",
    matriculeFiscale: "Matricule Fiscale",
    classement: "Classement",
    plafondCredit: "Plafond Cr??dit",
    mobiles: "Mobiles",
    siteWeb: "Site Web",
    conditionReglement: "Condition Reglement",
    typeTiers: "Type Tiers",
    credit: "Cr??dit",
    fax: "Fax",
    statusProspection: "Status Prospection",
    modeReglement: "Mode Reglement",
    paysFacturation: "Pays Facturation",
    gouvernoratFacturation: "Gouvernorat Facturation",
    delegationFacturation: "D??l??gation Facturation",
    localiteFacturation: "Localite Facturation",
    codePostaleFacturation: "Code Postale Facturation",
    adresseFacturation: "Adresse Facturation",
    paysLivraison: "Pays Livraison",
    gouvernoratLivraison: "Gouvernorat Livraison",
    delegationLivraison: "D??l??gation Livraison",
    localiteLivraison: "Localite Livraison",
    codePostaleLivraison: "Code Postale Livraison",
    adresseLivraison: "Adresse Livraison",
  }
  setClientID(id) {
    this.projet.client = id
  }
  //open modal ajout Client
  isOpenModalAjoutClient = false
  idAjoutClientModal = ""
  typeElement
  closeModalAjoutClient() {
    this.isOpenModalAjoutClient = false
    this.getAllParametres()
  }
  openModalAjoutClient() {
    this.typeElement = this.fonctionPartagesService.titreOfModal.ajouterClient
    this.isOpenModalAjoutClient = true
  }
}
