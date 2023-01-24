import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { GoogleMap, MapInfoWindow, MapMarker } from '@angular/google-maps';
import { ActivatedRoute, Router } from '@angular/router';
import { Estado } from 'src/app/models/estado';
import { GeocoderResponse } from 'src/app/models/geocoder-response';
import { Loja } from 'src/app/models/loja';
import { Municipio } from 'src/app/models/municipio';
import { IBGEServico } from 'src/app/servicos/IBGEServico';
import { LojaService } from 'src/app/servicos/loja.service';

@Component({
  selector: 'app-form-loja',
  templateUrl: './form-loja.component.html',
  styleUrls: ['./form-loja.component.css']
})
export class FormLojaComponent implements OnInit {

  constructor(
    private router: Router,
    private lojaService: LojaService,
    private http: HttpClient,
    private routerParams: ActivatedRoute,

  ) { }

  public tituloDoBotao: String = "Cadastrar";
  public loja: Loja | undefined = {} as Loja;
  public IBGEServico: IBGEServico = {} as IBGEServico;
  public estados: Estado[] = [];
  public municipios: Municipio[] | undefined = [];
  public estadoSelecionado: String = "1- Acre";
  public municipioSelecionado: String = "1- ";

  ngOnInit(): void {
    this.IBGEServico = new IBGEServico(this.http);
    let id: Number = this.routerParams.snapshot.params['id'];
    if (id) {
      this.editaLoja(id);
    }
    this.importarEstados();
  }

  private async editaLoja(id: Number) {
    this.tituloDoBotao = "Alterar";
    this.loja = await this.lojaService.buscaPorId(id);
  }

  private async importarEstados() {
    let estados = await this.IBGEServico.listaEstados();
    if (!estados) { } else {
      this.estados = estados;
    }
    this.importarCidades();
  }

  public async importarCidades() {
    this.municipios = await this.IBGEServico.listaMunicipiosPorEstado(Number(this.estados.at(Number(this.estadoSelecionado.split("-")[0]) - 1)?.id));

    this.municipioSelecionado = "1- ";
  }

  geoconding() {
    var geocoder = new google.maps.Geocoder();
    var address = `${this.loja?.logradouro}, ${this.loja?.numero} - ${this.loja?.bairro}, ${this.loja?.cidade} - ${this.loja?.estado}, ${this.loja?.cep}, BRAZIL`
    geocoder.geocode({ 'address': address }, (results: any, status) => {
      if (status == google.maps.GeocoderStatus.OK) {
        this.loja.latitude = results[0].geometry.location.lat();
        this.loja.longitude = results[0].geometry.location.lng();
      } else {
        console.log("Request failed.", this.loja);
      }
    })
  }
  async registrar() {
    this.geoconding();
    if (this.loja && this.loja.id > 0) {
      this.geoconding();
      this.loja.estado = this.estadoSelecionado.split("-")[1].trim()
      this.loja.cidade = this.municipioSelecionado.split("-")[1].trim()
      let loja = this.loja
      if (loja) {
        await this.lojaService.update(loja);
        this.router.navigateByUrl("/lojas");
        console.log(loja)
      }
    }
    else {
      if (!this.loja) { }
      else {
        let loja = this.loja
        if (loja) {
          this.geoconding();
          this.loja.estado = this.estadoSelecionado.split("-")[1].trim()
          this.loja.cidade = this.municipioSelecionado.split("-")[1].trim()
          await this.lojaService.criar(this.loja);
          console.log(loja)
          this.router.navigateByUrl("/lojas");
        }
      }
    }
  }

  number(val: String) {
    return Number(val);
  }
}
