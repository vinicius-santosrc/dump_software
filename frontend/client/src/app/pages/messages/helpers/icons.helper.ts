export abstract class Icon {
  protected svg: string;

  constructor(svg: string) {
    this.svg = this.normalize(svg);
  }

  private normalize(svg: string): string {
    return svg
      // preserve fill="none"
      .replace(/fill="none"/g, 'fill="none"')
      // replace other fills
      .replace(/fill="(?!none).*?"/g, 'fill="currentColor"')
      .replace(/stroke=".*?"/g, 'stroke="currentColor"');
  }

  getSvg(): string {
    return this.svg;
  }
}

export class HomeIcon extends Icon {
  constructor() {
    super(`
      <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M9.005 16.545C9.005 15.7501 9.32075 14.9878 9.8828 14.4258C10.4448 13.8638 11.2071 13.548 12.002 13.548C12.3957 13.5479 12.7855 13.6253 13.1492 13.7758C13.5129 13.9264 13.8434 14.1471 14.1218 14.4254C14.4002 14.7038 14.6211 15.0342 14.7718 15.3979C14.9224 15.7615 15 16.1513 15 16.545V22H22V11.543L12 2L2 11.543V22H9.005V16.545Z" stroke-width="2" stroke-linejoin="round"/>
      </svg>
    `);
  }
}

export class CreateIcon extends Icon {
    constructor() {
        super(`
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M2 12V15.45C2 18.299 2.698 19.455 3.606 20.394C4.546 21.303 5.704 22.002 8.552 22.002H15.448C18.296 22.002 19.454 21.302 20.394 20.394C21.302 19.455 22 18.3 22 15.45V8.552C22 5.703 21.302 4.546 20.394 3.607C19.454 2.7 18.296 2 15.448 2H8.552C5.704 2 4.546 2.699 3.606 3.607C2.698 4.547 2 5.703 2 8.552V12Z" stroke="#262626" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M6.54504 12.001H17.455" stroke="#262626" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M12.0031 6.54504V17.455" stroke="#262626" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>

    `);
    }
}

export class SearchIcon extends Icon {
    constructor() {
        super(`
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M19 10.5C19 12.1811 18.5015 13.8245 17.5675 15.2223C16.6335 16.6202 15.306 17.7096 13.7528 18.353C12.1996 18.9963 10.4906 19.1647 8.84174 18.8367C7.1929 18.5087 5.67834 17.6992 4.4896 16.5104C3.30085 15.3217 2.4913 13.8071 2.16333 12.1583C1.83535 10.5094 2.00368 8.80036 2.64703 7.24719C3.29037 5.69402 4.37984 4.3665 5.77766 3.43251C7.17547 2.49852 8.81886 2 10.5 2C12.7543 2 14.9164 2.89553 16.5104 4.48959C18.1045 6.08365 19 8.24566 19 10.5Z" stroke="#262626" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M16.511 16.511L22 22" stroke="#262626" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>

    `);
    }
}

export class ReelsIcon extends Icon {
    constructor() {
        super(`
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M2.04895 7.00195H21.95" stroke="#262626" stroke-width="2" stroke-linejoin="round"/>
<path d="M13.504 2.00098L16.362 7.00198" stroke="#262626" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M7.20703 2.10999L10.002 7.00199" stroke="#262626" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M2 12.001V15.45C2 18.299 2.698 19.456 3.606 20.395C4.546 21.303 5.704 22.002 8.552 22.002H15.448C18.296 22.002 19.454 21.303 20.394 20.395C21.302 19.456 22 18.299 22 15.45V8.552C22 5.704 21.302 4.546 20.394 3.607C19.454 2.699 18.296 2 15.448 2H8.552C5.704 2 4.546 2.699 3.606 3.607C2.698 4.546 2 5.704 2 8.552V12.001Z" stroke="#262626" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M9.76296 17.664C9.62483 17.5843 9.51015 17.4696 9.43045 17.3314C9.35075 17.1933 9.30885 17.0365 9.30896 16.877V11.63C9.30877 11.4703 9.35066 11.3134 9.43041 11.175C9.51016 11.0367 9.62496 10.9218 9.76325 10.8419C9.90153 10.762 10.0584 10.7199 10.2181 10.72C10.3778 10.72 10.5347 10.7621 10.673 10.842L15.218 13.466C15.3563 13.5458 15.4712 13.6606 15.551 13.7988C15.6309 13.937 15.673 14.0939 15.673 14.2535C15.673 14.4132 15.6309 14.57 15.551 14.7083C15.4712 14.8465 15.3563 14.9613 15.218 15.041L10.673 17.665C10.5346 17.7449 10.3777 17.787 10.218 17.787C10.0582 17.787 9.9013 17.7449 9.76296 17.665V17.664Z" fill="#262626"/>
</svg>


    `);
    }
}

export class ExploreIcon extends Icon {
    constructor() {
        super(`
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M13.9411 13.953L7.58105 16.424L10.0601 10.056L16.4201 7.58496L13.9411 13.953Z" stroke="#262626" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M10.0601 10.056L13.9491 13.945L7.58105 16.424L10.0601 10.056Z" fill="#262626"/>
<path d="M12.001 22.505C17.8 22.505 22.501 17.804 22.501 12.005C22.501 6.20602 17.8 1.505 12.001 1.505C6.20199 1.505 1.50098 6.20602 1.50098 12.005C1.50098 17.804 6.20199 22.505 12.001 22.505Z" stroke="#262626" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>



    `);
    }
}


// 🔥 Future icons example
// export class LikeIcon extends Icon { ... }
// export class MessageIcon extends Icon { ... }

// 🔥 Factory (optional, but keeps usage clean)
export class IconFactory {
  static get(name: string): Icon {
    switch (name) {
      case 'home':
        return new HomeIcon();

      default:
        throw new Error(`Icon "${name}" not found`);
    }
  }
}