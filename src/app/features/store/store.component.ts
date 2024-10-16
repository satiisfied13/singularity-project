import { Component, OnInit } from '@angular/core';
import { Product } from '../../models/product.interface';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { filter, map } from 'rxjs/operators';
import { StoreService } from '../../services/store.service';
import { SpinnerComponent } from '../../core/spinner/spinner.component';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms'; 
import { ProductService } from '../../services/product.service';
import { User } from '../../models/user.model';
import { environment } from '../../../environments/environment.development';

@Component({
  selector: 'app-store',
  standalone: true,
  imports: [CommonModule, RouterModule, SpinnerComponent, FormsModule, ReactiveFormsModule],
  templateUrl: './store.component.html',
  styleUrls: ['./store.component.css']
})
export class StoreComponent implements OnInit {

  categoriesFilterForm: FormGroup;
  isProductChosen = false;
  isFilterToggled = false;
  user: User;
  isOpen = false;
  isLoading = false;
  searchModel = '';
  isCategoriesVisible = false;
  isPriceVisible = false;
  minPrice: number = 0;
  maxPrice: number = 10000;
  selectedMinPrice: number = 0;
  selectedMaxPrice: number = 10000;
  categories = []; 
  products: Product[] = [];
  filteredProducts: Product[] = [];
  searchFilteredProducts: Product[] = [];
  cartProducts: Product[] = [];
  productsPerPage = 9; 
  currentPage = 1; 

  URL = environment.URL;

  priceFilterForm: FormGroup = new FormGroup({
    min: new FormControl(this.minPrice),
    max: new FormControl(this.maxPrice)
  })

  constructor(
    private router: Router,
    private storeService: StoreService,
    private fb: FormBuilder,
    private productService: ProductService
  ) {}

  ngOnInit(): void {

    this.user = JSON.parse(localStorage.getItem('user'));

    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        if (event.url === '/store') {
          this.isProductChosen = false;
        }
      });

    this.isLoading = true;

    this.storeService.getCategories().pipe(map(
      data => {
        for (let key in data) {
          this.categories.push({ ...data[key], id: key });
        }
      }
    )).subscribe(() => {
      this.categoriesFilterForm = this.fb.group(
        this.categories.reduce((group, category) => {
          group[category.name] = new FormControl(false);
          return group;
        }, {})
      );
    });

    this.storeService.getProducts().pipe(map(
      data => {
        for (let key in data) {
          this.products.push({ ...data[key], id: key });
        }
        this.filteredProducts = this.products;
      }
    )).subscribe(() => {
      this.isLoading = false;
    });

    this.priceFilterForm.controls['min'].valueChanges.subscribe(value => {
      this.syncPriceInputs('min', value);
    });

    this.priceFilterForm.controls['max'].valueChanges.subscribe(value => {
      this.syncPriceInputs('max', value);
    });

  }

  syncPriceInputs(controlName: string, value: number) {
    if (controlName === 'min' && value >= this.minPrice && value <= this.priceFilterForm.value.max) {
      this.selectedMinPrice = value;
    }

    if (controlName === 'max' && value <= this.maxPrice && value >= this.priceFilterForm.value.min) {
      this.selectedMaxPrice = value;
    }
  }

  onProductChosen(i: number) {
    this.isProductChosen = true;
    localStorage.setItem('product', JSON.stringify(this.paginatedProducts[i]));
    this.router.navigate(['/store' + '/' + this.paginatedProducts[i].productCode]);
  }

  onToggleFilter() {
    this.isFilterToggled = !this.isFilterToggled;
    this.isOpen = !this.isOpen;
    this.isCategoriesVisible = false;
    this.isPriceVisible = false;
  }

  onGoBackToStore() {
    localStorage.removeItem('product');
    this.router.navigate(['/store']);
    this.isProductChosen = false;
  }

  onSearch() {
    if (this.searchModel) {
      this.searchFilteredProducts = this.products.filter(product =>
        product.name.toLowerCase().includes(this.searchModel.toLowerCase())
      );
    } else {
      this.searchFilteredProducts = this.products;
    }
  }

  toggleCategories() {
    this.isCategoriesVisible = !this.isCategoriesVisible;
  }

  togglePriceFilter() {
    this.isPriceVisible = !this.isPriceVisible;
  }

  onSubmitFilter() {
    const { min, max } = this.priceFilterForm.value;
    const selectedCategories = Object.entries(this.categoriesFilterForm.value)
    .filter(([categoryName, isChecked]) => isChecked)  
    .map(([categoryName]) => categoryName);   
    const temp = this.products.filter(product => 
      product.price >= +min && product.price <= +max
    )

    if (selectedCategories.length > 0) {
      this.filteredProducts = temp.filter(product => 
        selectedCategories.includes(product.category)
      );
    } else {
      this.filteredProducts = temp;
    }

  }

  onClearFilters() {
    this.categoriesFilterForm.reset();
    this.priceFilterForm.setValue({min: this.minPrice, max: this.maxPrice});
    this.filteredProducts = this.products;
  }

  onAddToCart(i) {
    let item = JSON.parse(localStorage.getItem(this.products[i].name));
    if(JSON.parse(localStorage.getItem(this.products[i].name))) {
      this.productService.addItemToCart(item, this.products[i], this.cartProducts, true);
    } else {
      this.productService.addItemToCart(item, this.products[i], this.cartProducts, false);
    }
  }

  get paginatedProducts() {
    const startIndex = (this.currentPage - 1) * this.productsPerPage;
    return this.filteredProducts.slice(startIndex, startIndex + this.productsPerPage);
  }

  get totalPages() {
    return Math.ceil(this.filteredProducts.length / this.productsPerPage);
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

}
