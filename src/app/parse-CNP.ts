export const parseCNP = (cnp: string) : ParsedCNP => {
    //SYYMMDDJJDDDC
    //https://ro.wikipedia.org/wiki/Cod_numeric_personal
    const rgx = /^[0-9]{13}$/;
    if(!cnp.match(rgx)) throw { invalidStructure: true };
    const yearSex = Number(cnp[0]);
    if(!(1 <= yearSex && yearSex <= 8)) throw { invalidYearSex: true }
    let parsedData : any = {}
    if(yearSex % 2 == 0)
        parsedData["gender"] = 'female';
    else
        parsedData["gender"] = 'male';

    let date = '';
    if(yearSex >= 7) {
        parsedData["isResident"] = true;
    } else {
        if([1, 2].includes(yearSex))
            date = '19';
        else if([3, 4].includes(yearSex))
            date = '18';
        else
            date = '20';
    }
    date += cnp.substring(1, 3) + '-' + cnp.substring(3, 5) + '-' + cnp.substring(5, 7) // YYYY-MM-DD
    const dateParsed = Date.parse(date);
    if(isNaN(dateParsed)) throw { invalidDate: true };
    else parsedData["dateBorn"] = dateParsed;

    const county = Number(cnp.substring(7, 9))
    if(!((1 <= county && county <= 46) || [51, 52].includes(county))) throw { invalidCounty: true }
    else parsedData["countyCode"] = county;

    const mockCnp = '279146358279'
    let sum = 0;
    for(let i = 0; i < cnp.length - 1; i++) {
        sum += Number(cnp[i]) * Number(mockCnp[i]);
    }
    sum %= 11;
    sum = sum == 10 ? 1 : sum;
    if(Number(cnp[12]) != sum) throw { invalidControlDigit: true } 

    return parsedData;
}

export interface ParsedCNP {
    gender: 'male' | 'female',
    countyCode: number
    dateBorn?: number,
    isResident?: boolean
}