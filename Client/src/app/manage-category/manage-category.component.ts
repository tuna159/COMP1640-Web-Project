import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ConfirmationService } from 'primeng/api';
import { MessageService } from 'primeng/api';
import { AuthenticationService } from '../auth/services/authentication.service';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { PostComponent } from '../idea-event/post/post.component';
import { AddCategoryComponent } from './add-category/add-category/add-category.component';

interface Category {
  id?: string;
  name?: string;
}

@Component({
  selector: 'app-manage-category',
  templateUrl: './manage-category.component.html',
  styleUrls: ['./manage-category.component.css'],
  providers: [MessageService, ConfirmationService, DialogService],
})
export class ManageCategoryComponent implements OnInit {
  cols: Array<any> = [];
  ref: DynamicDialogRef;
  listData: any[] = [];
  displayXoa: boolean;
  displayXoaN: boolean;
  id: number;
  name: string;
  apiUrl: string = 'http://localhost:3009/api/category';
  listSelectedData: Array<any> = [];
  categoryDialog: boolean;
  constructor(
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private router: Router,
    private http: HttpClient,
    private authService: AuthenticationService,
    private dialogService: DialogService
  ) {
    this.getAllData();
  }

  ngOnInit() {
    this.cols = [
      { field: 'Number', header: 'Number', width: '5%', textAlign: 'center' },
      { field: 'name', header: 'Name', width: '30%', textAlign: 'center' },
      {
        field: 'Edit/Delete',
        header: 'Edit/Delete',
        width: '15%',
        textAlign: 'center',
      },
    ];
  }

  getAllData() {
    this.http
      .get<any>(this.apiUrl, {
        headers: {
          Authorization: 'Bearer ' + this.authService.getToken(),
        },
      })
      .subscribe((result: any) => {
        if (result.status_code != 200) {
          this.showMessage('error', result.error_message);
          return;
        }
        this.listData = result.data.map((item, index) =>
          Object.assign(
            {
              Stt: index + 1,
            },
            item
          )
        );
      });
  }

  chinhSua(data) {
    this.ref = this.dialogService.open(AddCategoryComponent, {
      header: 'Edit Category',
      width: '30%',
      contentStyle: { 'max-height': '800px', overflow: 'auto' },
      baseZIndex: 10000,
    });
  }

  showDialogXoa(data) {
    this.displayXoa = true;
    this.id = data.category_id;
  }

  showDialogXoaN() {
    this.displayXoaN = true;
  }

  deleteCategories() {
    if(this.listSelectedData.length){
      for(let i = 0; i < this.listSelectedData.length; i++) {
        this.id = this.listSelectedData[i].category_id;
        this.deleteCategory();
      }
      this.listSelectedData = null;
    } else {
      this.displayXoaN = false;
    }
  }

  async deleteCategory() { 
    this.http.delete(this.apiUrl +'/'+ this.id, {headers: {
      Authorization: 'Bearer ' + this.authService.getToken()}
    }).subscribe(() => {
      this.showMessage('success', 'Delete success');
      this.displayXoa = false;
      this.displayXoaN = false;
      this.getAllData();
    }, (err: any) => {
      this.showMessage("error: ", err.error.message);

    });
  }

  showMessage(severity: string, detail: string) {
    this.messageService.add({
      severity: severity,
      summary: 'Notification:',
      detail: detail,
    });
  }

  openNewCategory(data) {
    if(!data) {
        this.ref = this.dialogService.open(AddCategoryComponent, {
          header: 'Add Category',
          width: '30%',
          contentStyle: { "max-height": "800px", "overflow": "auto" },
          baseZIndex: 10000,
          data: {

          }
        });
        this.ref.onClose.subscribe((result) => {
          if (result) {
              this.showMessage("Add success: ", result);
              this.getAllData();

          }
      });
    } else {
      this.ref = this.dialogService.open(AddCategoryComponent, {
        header: 'Edit Category',
        width: '30%',
        contentStyle: { 'max-height': '800px', overflow: 'auto' },
        baseZIndex: 10000,
        data: data,
      });
      this.ref.onClose.subscribe((result) => {
        if (result) {
            this.showMessage("Edit success: ", result);
            this.getAllData();
        }
    });
    }
  }
}
