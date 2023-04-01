import { Component, OnInit } from '@angular/core';
import { HttpParams, HttpClient, HttpHeaders } from '@angular/common/http';
import { Person } from '../module/person';
import { PersonService } from '../service/person/person.service';
import { PaydatecalculatorService } from '../service/paydatecalculator/paydatecalculator.service';
import { Holiday } from '../module/holyday';
import { FormControl, FormGroup, Validators } from '@angular/forms';
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  edit: Boolean= false;
  people: Person[]=[];
  selectedPerson!: Person;
  holidays: Holiday[]=[];

  checkoutForm: FormGroup
  holiday!: Holiday;


  constructor(private personService: PersonService,private paydatecalculatorService: PaydatecalculatorService) {
    this.checkoutForm = new FormGroup({
      name: new FormControl('', Validators.required),
      date: new FormControl('', Validators.required),
    });
   }

  ngOnInit() {
    this.getHolidays()
   
    this.getPeople();
  }
  getPeople(): void {
    this.personService.getPeople()
        .subscribe(people => this.people = people);
  }
  delete(person: Person): void {
    this.people = this.people.filter(h => h !== person);
    this.personService.deletePerson(person).subscribe();
  }
onSelect(person: Person): void {
  this.selectedPerson = person;
  this.edit=true;
}
getHolidays(): void {
  this.paydatecalculatorService.getHolidays()
      .subscribe(holidays => this.holidays = holidays);
}
onadd(): void {
   this.edit=false;
}

deleteholiday(holiday: Holiday): void {
  this.holidays = this.holidays.filter(h => h !== holiday);
  this.paydatecalculatorService.deleteHoliday(holiday).subscribe();
}
onSubmit() {

  this.holiday = this.checkoutForm.value;
  this.paydatecalculatorService.addHoliday(this.holiday)
    .subscribe(holiday => {
      this.holiday.id = holiday.id
      this.holidays.push(this.holiday);
      this.checkoutForm.reset();
    });
}
}