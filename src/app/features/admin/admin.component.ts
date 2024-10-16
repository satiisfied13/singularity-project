import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Product } from '../../models/product.interface';
import { CommonModule } from '@angular/common';
import { StoreService } from '../../services/store.service';
import { SpinnerComponent } from '../../core/spinner/spinner.component';
import { map } from 'rxjs';
import { AdminService } from '../../services/admin.service';
import { Category } from '../../models/category.interface';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, CommonModule, SpinnerComponent,],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css'
})
export class AdminComponent implements OnInit{

  products: Product[] = [];
  categories: Category[] = [];
  status = '';
  error = '';
  isLoading = false;
  isLoading2 = false;
  formType: 'category' | 'product' = null;
  

  constructor(
    private storeService: StoreService,
    private adminService: AdminService
  ){}

  ngOnInit(): void {
    this.isLoading = true;
    this.formType = 'product';
    this.storeService.getProducts().pipe(
      map( respData => {
        for(let key in respData) {
          this.products.push({...respData[key], id: key});
        }
      })
    ).subscribe( data => {
      this.isLoading = false;
    });
  }

  adminProductForm = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.minLength(2)]),
    description: new FormControl('', [Validators.required, Validators.minLength(2)]),
    price: new FormControl('', [Validators.required, Validators.minLength(2)]),
    image: new FormControl('', [Validators.required, Validators.minLength(2)]),
    category: new FormControl('', [Validators.required, Validators.minLength(2)]),
    productCode: new FormControl('', [Validators.required, Validators.minLength(2)])
  })

  adminCategoryForm = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.minLength(2)]),
    categoryCode: new FormControl('', [Validators.required, Validators.minLength(2)])
  })

  onAddProduct() {
    this.status = '';
    this.error = '';
    if(this.adminProductForm.valid) {
      this.isLoading2 = true;
      this.adminService.setProduct(this.adminProductForm.value).subscribe( data => {
        this.status = 'Data sent succsesfully!';
        this.products = [];
        this.isLoading = true;
        this.storeService.getProducts().pipe(
          map( respData => {
            for(let key in respData) {
              this.products.push({...respData[key], id: key});
            }
          })
        ).subscribe( data => {
          this.isLoading = false;
        });
        this.isLoading2 = false;
      }, error => {
        this.error = 'An error occured!'
      });
      this.adminProductForm.reset();
    } else {
      this.adminProductForm.reset();
      this.error = 'Data is incorrect!';
    }
  }

  onAddCategory() {
    this.status = '';
    this.error = '';
    if(this.adminCategoryForm.valid) {
      this.isLoading2 = true;
      this.adminService.setCategory(this.adminCategoryForm.value).subscribe( data => {
        this.status = 'Data sent succsesfully!';
        this.categories = [];
        this.isLoading = true;
        this.storeService.getCategories().pipe(
          map( respData => {
            for(let key in respData) {
              this.categories.push({...respData[key], id: key});
            }
          })
        ).subscribe( data => {
          this.isLoading = false;
        });
        this.isLoading2 = false;
      }, error => {
        this.error = 'An error occured!'
      });
      this.adminCategoryForm.reset();
    } else {
      this.adminCategoryForm.reset();
      this.error = 'Data is incorrect!';
    }
  }

  onDeleteCategory(i) {
    this.adminService.deleteCategory(this.categories[i].id).subscribe();
    this.categories.splice(i, 1);
  }

  onDeleteProduct(i) {
    this.adminService.deleteProduct(this.products[i].id).subscribe();
    this.products.splice(i, 1);
  }

  onChooseForm(form) {
    this.status = '';
    this.error = '';
    this.isLoading = true;
    this.categories = [];
    this.storeService.getCategories().pipe(
      map( respData => {
        for(let key in respData) {
          this.categories.push({...respData[key], id: key});
        }
      })
    ).subscribe( data => {
    });
    this.products = [];
    this.storeService.getProducts().pipe(
      map( respData => {
        for(let key in respData) {
          this.products.push({...respData[key], id: key});
        }
      })
    ).subscribe( data => {
      this.isLoading = false;
    });
    this.formType = form;
  }

}
