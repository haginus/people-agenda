import { Pipe, PipeTransform } from '@angular/core';
import { parseCNP } from '../parse-CNP';

@Pipe({
  name: 'age'
})
export class AgePipe implements PipeTransform {
  // Takes CNP, returns age
  transform(value: string): string {
    try {
      const parsed = parseCNP(value);
      if(!parsed.isResident) {
        const age = this.getAge(parsed.dateBorn);
        let str : string = age + ' ';
        if(age >= 20) str += 'de ';
        str += (age == 1) ? 'an' : 'ani';
        return str;
      }
      else
        return 'cetățean rezident';
    } catch(e) {
      return null;
    }
  }

  private getAge = (date : number) => {
    let today = new Date();
    let birthDate = new Date(date);
    let age = today.getFullYear() - birthDate.getFullYear();
    let m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
  }

}
