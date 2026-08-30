import { IonApp, IonRouterOutlet } from '@ionic/react'
import { IonReactRouter } from '@ionic/react-router'
import { Route, Redirect } from 'react-router-dom'
import { ProtectedRoute } from './components/guards/ProtectedRoute'
import { AdminRoute } from './components/guards/AdminRoute'
import { LeadershipRoute } from './components/guards/LeadershipRoute'
import { SalesRoute } from './components/guards/SalesRoute'
import { PurchasingRoute } from './components/guards/PurchasingRoute'
import { DashboardLayout } from './components/layout/DashboardLayout'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { DashboardPage } from './pages/DashboardPage'
import { UsersPage } from './pages/UsersPage'
import { SettingsPage } from './pages/SettingsPage'
import { AuditLogPage } from './pages/AuditLogPage'
import { InventoryDashboardPage } from './pages/inventory/InventoryDashboardPage'
import { ProductsPage } from './pages/inventory/ProductsPage'
import { ProductDetailPage } from './pages/inventory/ProductDetailPage'
import { MovementsPage } from './pages/inventory/MovementsPage'
import { ProvidersPage } from './pages/inventory/ProvidersPage'
import { PurchaseOrdersPage } from './pages/inventory/PurchaseOrdersPage'
import { DispatchesPage } from './pages/inventory/DispatchesPage'
import { StockAlertsPage } from './pages/inventory/StockAlertsPage'
import { CustomersPage } from './pages/sales/CustomersPage'
import { QuotationsPage } from './pages/sales/QuotationsPage'
import { OrdersPage } from './pages/sales/OrdersPage'
import { PurchasingPage } from './pages/compras/PurchasingPage'
import { RequestsPage } from './pages/compras/RequestsPage'
import { PurchaseOrdersTrackingPage } from './pages/compras/PurchaseOrdersTrackingPage'
import { ProviderReportPage } from './pages/compras/ProviderReportPage'
import { ReportCenterPage } from './pages/reports/ReportCenterPage'
import { PoApprovalsPage } from './pages/reports/PoApprovalsPage'
import { NotFoundPage } from './pages/NotFoundPage'

function App() {
  return (
    <IonApp>
      <IonReactRouter>
        <IonRouterOutlet animated={false}>
          <Route path="/login" component={LoginPage} exact />
          <Route path="/register" component={RegisterPage} exact />
          <Route
            path="/dashboard"
            render={() => (
              <ProtectedRoute>
                <DashboardLayout>
                  <DashboardPage />
                </DashboardLayout>
              </ProtectedRoute>
            )}
            exact
          />
          <Route
            path="/users"
            render={() => (
              <ProtectedRoute>
                <LeadershipRoute>
                  <DashboardLayout>
                    <UsersPage />
                  </DashboardLayout>
                </LeadershipRoute>
              </ProtectedRoute>
            )}
            exact
          />
          <Route
            path="/settings"
            render={() => (
              <ProtectedRoute>
                <AdminRoute>
                  <DashboardLayout>
                    <SettingsPage />
                  </DashboardLayout>
                </AdminRoute>
              </ProtectedRoute>
            )}
            exact
          />
          <Route
            path="/audit"
            render={() => (
              <ProtectedRoute>
                <LeadershipRoute>
                  <DashboardLayout>
                    <AuditLogPage />
                  </DashboardLayout>
                </LeadershipRoute>
              </ProtectedRoute>
            )}
            exact
          />
          <Route
            path="/reports"
            render={() => (
              <ProtectedRoute>
                <LeadershipRoute>
                  <DashboardLayout>
                    <ReportCenterPage />
                  </DashboardLayout>
                </LeadershipRoute>
              </ProtectedRoute>
            )}
            exact
          />
          <Route
            path="/approvals"
            render={() => (
              <ProtectedRoute>
                <LeadershipRoute>
                  <DashboardLayout>
                    <PoApprovalsPage />
                  </DashboardLayout>
                </LeadershipRoute>
              </ProtectedRoute>
            )}
            exact
          />
          <Route
            path="/inventory"
            render={() => (
              <ProtectedRoute>
                <DashboardLayout>
                  <InventoryDashboardPage />
                </DashboardLayout>
              </ProtectedRoute>
            )}
            exact
          />
          <Route
            path="/inventory/products"
            render={() => (
              <ProtectedRoute>
                <DashboardLayout>
                  <ProductsPage />
                </DashboardLayout>
              </ProtectedRoute>
            )}
            exact
          />
          <Route
            path="/inventory/products/:id"
            render={() => (
              <ProtectedRoute>
                <DashboardLayout>
                  <ProductDetailPage />
                </DashboardLayout>
              </ProtectedRoute>
            )}
            exact
          />
          <Route
            path="/inventory/movements"
            render={() => (
              <ProtectedRoute>
                <DashboardLayout>
                  <MovementsPage />
                </DashboardLayout>
              </ProtectedRoute>
            )}
            exact
          />
          <Route
            path="/inventory/providers"
            render={() => (
              <ProtectedRoute>
                <DashboardLayout>
                  <ProvidersPage />
                </DashboardLayout>
              </ProtectedRoute>
            )}
            exact
          />
          <Route
            path="/inventory/purchases"
            render={() => (
              <ProtectedRoute>
                <DashboardLayout>
                  <PurchaseOrdersPage />
                </DashboardLayout>
              </ProtectedRoute>
            )}
            exact
          />
          <Route
            path="/inventory/dispatches"
            render={() => (
              <ProtectedRoute>
                <DashboardLayout>
                  <DispatchesPage />
                </DashboardLayout>
              </ProtectedRoute>
            )}
            exact
          />
          <Route
            path="/inventory/alerts"
            render={() => (
              <ProtectedRoute>
                <DashboardLayout>
                  <StockAlertsPage />
                </DashboardLayout>
              </ProtectedRoute>
            )}
            exact
          />
          <Route
            path="/sales/customers"
            render={() => (
              <ProtectedRoute>
                <SalesRoute>
                  <DashboardLayout>
                    <CustomersPage />
                  </DashboardLayout>
                </SalesRoute>
              </ProtectedRoute>
            )}
            exact
          />
          <Route
            path="/sales/quotations"
            render={() => (
              <ProtectedRoute>
                <SalesRoute>
                  <DashboardLayout>
                    <QuotationsPage />
                  </DashboardLayout>
                </SalesRoute>
              </ProtectedRoute>
            )}
            exact
          />
          <Route
            path="/sales/orders"
            render={() => (
              <ProtectedRoute>
                <SalesRoute>
                  <DashboardLayout>
                    <OrdersPage />
                  </DashboardLayout>
                </SalesRoute>
              </ProtectedRoute>
            )}
            exact
          />
          <Route
            path="/compras"
            render={() => (
              <ProtectedRoute>
                <PurchasingRoute>
                  <DashboardLayout>
                    <PurchasingPage />
                  </DashboardLayout>
                </PurchasingRoute>
              </ProtectedRoute>
            )}
            exact
          />
          <Route
            path="/compras/requests"
            render={() => (
              <ProtectedRoute>
                <PurchasingRoute>
                  <DashboardLayout>
                    <RequestsPage />
                  </DashboardLayout>
                </PurchasingRoute>
              </ProtectedRoute>
            )}
            exact
          />
          <Route
            path="/compras/purchase-orders"
            render={() => (
              <ProtectedRoute>
                <PurchasingRoute>
                  <DashboardLayout>
                    <PurchaseOrdersTrackingPage />
                  </DashboardLayout>
                </PurchasingRoute>
              </ProtectedRoute>
            )}
            exact
          />
          <Route
            path="/compras/report"
            render={() => (
              <ProtectedRoute>
                <PurchasingRoute>
                  <DashboardLayout>
                    <ProviderReportPage />
                  </DashboardLayout>
                </PurchasingRoute>
              </ProtectedRoute>
            )}
            exact
          />
          <Redirect exact from="/" to="/dashboard" />
          <Route component={NotFoundPage} />
        </IonRouterOutlet>
      </IonReactRouter>
    </IonApp>
  )
}

export default App
