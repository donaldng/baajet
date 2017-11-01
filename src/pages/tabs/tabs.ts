import { Component } from '@angular/core';

import { HomePage } from '../home/home';
import { ExpensesPage } from '../expenses/expenses';
import { SettingPage } from '../setting/setting';

@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {

  tab1Root = HomePage;
  tab2Root = ExpensesPage;
  tab3Root = SettingPage;

  constructor() {
  }
}
