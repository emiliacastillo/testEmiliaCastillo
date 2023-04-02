import { Component, OnInit, Input } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { PersonService } from '../service/person/person.service';
import { Holiday } from '../module/holiday';
import { Person } from '../module/person';
import { PaydatecalculatorService } from '../service/paydatecalculator/paydatecalculator.service';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit {
  person!: Person;
  @Input() edit!: Boolean;
  @Input() holidays!: Holiday[];
  checkoutForm: FormGroup;
  @Input() people!: Person[];
  items!: any[];
  duedate!: string;
  final!: Date;
  constructor(private personService: PersonService, private paydatecalculatorService: PaydatecalculatorService) {
    this.checkoutForm = new FormGroup({
      name: new FormControl('', Validators.required),
      salary: new FormControl('', Validators.required),
      fundDate: new FormControl('', Validators.required),
      payDay: new FormControl({ value: '', disabled: true }, Validators.required),
      dueDate: new FormControl({ value: '', disabled: true }),
      directDeposit: new FormControl(''),
      payspan: new FormControl({ value: '', disabled: true }, Validators.required)
    });
    this.items = ["Weekly", "Bi-Weekly", "Monthly"]
  }

  ngOnInit() {
  }
  getperson(): void {
    this.personService.getPerson(this.person.id)
      .subscribe(person => this.person = person);
  }

  onSubmit() {
    
    const e = new Date(this.checkoutForm.value.payDay)
    if (this.items.includes(this.checkoutForm.value.payspan) && e <= this.final && this.checkoutForm.value.payDay >= this.checkoutForm.value.fundDate && this.checkoutForm.value.name!='') {
     
        this.person = this.checkoutForm.value;
        this.person.dueDate = this.duedate;
        this.personService.addPerson(this.person)
          .subscribe(person => {
            this.person.id = person.id
            this.people.push(this.person);
            this.checkoutForm.reset();
            this.person.dueDate = '';
            this.checkoutForm.controls['payDay'].disable()
            this.checkoutForm.controls['payspan'].disable()
          });
      
    } else {
      alert('invalid form, check the data ')
    }
  }
  payDatecalculated(): void {
    var array: Date[] = this.holidays.map((a) => {
      let day=new Date(a.date);
      day.setDate(day.getDate() + 1);

      return day;
    })
    let fundday=new Date(this.checkoutForm.value.fundDate);
    fundday.setDate(fundday.getDate() + 1);
    let payday=new Date(this.checkoutForm.value.payDay);
    payday.setDate(fundday.getDate() + 1);
    var date: Date = this.paydatecalculatorService.calculateDueDate(fundday, array, this.checkoutForm.value.payspan,payday , this.checkoutForm.value.directDeposit
    )
    let day = '' + date.getDate();
    let month = '' + (date.getMonth() + 1);
    const year = date.getFullYear();
    if (month.length < 2)
      month = '0' + month;
    if (day.length < 2)
      day = '0' + day;
    this.final = date;
    this.duedate = [year, month, day].join('-');
    const cad = [month, day, year].join('/');
    this.checkoutForm.controls['dueDate'].setValue(cad);
  }
  enablespan() {
    this.checkoutForm.controls['payspan'].enable();
    this.checkoutForm.controls['payDay'].setValue('')
    this.checkoutForm.controls['payDay'].disable()
    if (this.items.includes(this.checkoutForm.value.payspan)) {
      this.checkoutForm.controls['payDay'].enable()
      this.payDatecalculated();
    }
  }
  enabledays() {
    if (this.items.includes(this.checkoutForm.value.payspan)) {
      this.checkoutForm.controls['payDay'].enable()
      this.payDatecalculated();
    }


  }
  validdays() {
    const e = new Date(this.checkoutForm.value.payDay)
    if (e > this.final || this.checkoutForm.value.payDay < this.checkoutForm.value.fundDate) {
      alert('Pay day outsite')
      this.checkoutForm.controls['payDay'].setValue('')

    }
  }
}
