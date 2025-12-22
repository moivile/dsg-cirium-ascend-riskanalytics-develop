export class PrimeNGTableService {

  showHideHoverSortIcon(sortIcon: any, selectedSortIcon: any, mouseenter: boolean): void {
    if (selectedSortIcon !== sortIcon && mouseenter) {
      this.showSortIcon(sortIcon);
    }

    if (!mouseenter) {
      this.removeHoverIcon(sortIcon);
    }
  }

  showSortIcon(selectedSortIcon: any): void {
    if (selectedSortIcon) {
      selectedSortIcon.style.display = 'block';
    }
  }

  private removeHoverIcon(sortIcon: any): void {
    if(sortIcon!==null && sortIcon!==undefined){
      sortIcon.style.display = 'none';
    }
  }
}
