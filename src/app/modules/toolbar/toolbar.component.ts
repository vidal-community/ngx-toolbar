import {Component, OnInit, ViewChild, ElementRef, Input} from '@angular/core';
import {Router} from '@angular/router';
import {Location} from '@angular/common';
import {Observable} from 'rxjs/Rx';
import {DiscoveryService, Service} from 'vidal-ngx-discovery';
import {SesameService} from 'vidal-ngx-sesame';
import {Http} from '@angular/http';

const USER_DEFAULT_ICON = {
  'background': 'url(assets/images/photo.png) no-repeat center',
  'background-size': '100%'
};

@Component({
  selector: 'vidal-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.css']
})
export class ToolbarComponent implements OnInit {
  @ViewChild('searchBtn') searchBtn: ElementRef;

  @Input() applicationName: string;
  @Input() appLogo: string;

  logo: string;
  username: string;
  userIcon = USER_DEFAULT_ICON;
  login: string;
  password: string;
  showAllApps = false;
  shouldDisplayMoreApps: Promise<boolean>;
  search = '';
  applications: Observable<Service[]>;
  todos: Observable<Service[]>;
  searches: Observable<Service[]>;

  constructor(private sesameService: SesameService,
              private discovery: DiscoveryService,
              private router: Router,
              private location: Location,
              private http: Http) {

    this.sesameService.userInfo().subscribe(userInfo => {
      if (userInfo === undefined) {
        this.redirectToWelcomePage();
      }
      this.username = userInfo && userInfo.username || undefined;
    });

    this.sesameService.myFaceUrl().map(faceUrl => {
      if (!faceUrl) {
        return USER_DEFAULT_ICON;
      } else {
        return {
          'background': `url(${faceUrl}) no-repeat center`,
          'background-size': '32px auto'
        };
      }
    }).subscribe(style => {
      this.userIcon = style;
    });
  }

  ngOnInit() {
    this.logo = 'assets/images/logo_vidal_2017.png';
  }

  public connect() {
    this.sesameService.login(this.login, this.password);
    this.password = undefined;
  }

  public logout() {
    this.sesameService.logout();
  }

  redirectToWelcomePage() {
    this.location.replaceState('/'); // clears browser history so they can't navigate with back button
    this.router.navigate(['welcome']);
  }

  keepTargetedUrl(router: Router) {
    if (!this.isRegularUrl(this.router)) {
      this.router.navigate(['search']);
    }
  }

  isRegularUrl(router: Router) {
    const infoIdRegex = /(\/infos\/*)/i;
    return this.router.url.match(infoIdRegex) != null;
  }

  updateApps(): void {
    this.showAllApps = false;
    this.applications = this.discovery
      .services('APPLICATION')
      .map(apps => {
          apps.forEach(app => app.meta.display = this.isDisplayed(app));
          apps.sort((s1, s2) => s1.shortDescription.localeCompare(s2.shortDescription));
          this.shouldDisplayMoreApps = this.hasHiddenApps(apps);
          return apps;
        }
      );
  }

  displayAllApps(event: Event, applications: any[]) {
    event.stopPropagation();
    event.preventDefault();
    this.showAllApps = true;
  }

  async hasHiddenApps(applications: Service[]): Promise<boolean> {
    const hiddenFlags = await  Promise.all(applications.map(app => app.meta.display));
    return hiddenFlags.filter(flag => flag === false).length !== 0;
  }

  updateTodos(): void {
    this.todos = this.discovery
      .services('todolist')
      .map(todos => {
        todos.forEach(todo => todo.meta.counter = this.countTodo(todo));
        todos.forEach(todo => todo.meta.display = this.isDisplayed(todo));
        todos.sort((s1, s2) => s1.shortDescription.localeCompare(s2.shortDescription));
        return todos;
      });
  }

  async isDisplayed(service): Promise<boolean> {
    if (service == null || service.meta == null || service.meta.roles == null) {
      return Promise.resolve(true);
    }

    return await this.sesameService.hasAnyRoles(service.meta.roles).first().toPromise();
  }

  countTodo(todo: any): Observable<string> {
    let counterObservable;

    if (todo.meta != null && todo.meta.counters != null) {
      counterObservable = this.http.get(todo.meta.counters).map(r => r.text());
    } else {
      counterObservable = Observable.of('');
    }

    return Observable.of('...').concat(counterObservable);
  }

  updateSearch(value): void {
    this.searches = this.discovery.services('search', [value]);
  }

  showSearch(): void {
    this.searchBtn.nativeElement.click();
  }
}
