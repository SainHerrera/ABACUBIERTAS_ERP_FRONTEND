import { IonApp, IonRouterOutlet } from '@ionic/react'
import { IonReactRouter } from '@ionic/react-router'
import { Route, Redirect } from 'react-router-dom'
import { ProtectedRoute } from './components/guards/ProtectedRoute'
import { AdminRoute } from './components/guards/AdminRoute'
import { DashboardLayout } from './components/layout/DashboardLayout'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { DashboardPage } from './pages/DashboardPage'
import { UsersPage } from './pages/UsersPage'
import { InventoryDashboardPage } from './pages/inventory/InventoryDashboardPage'
import { ProductsPage } from './pages/inventory/ProductsPage'
import { ProductDetailPage } from './pages/inventory/ProductDetailPage'
import { MovementsPage } from './pages/inventory/MovementsPage'
import { ProvidersPage } from './pages/inventory/ProvidersPage'
import { CustomersPage } from './pages/sales/CustomersPage'
import { QuotationsPage } from './pages/sales/QuotationsPage'
import { OrdersPage } from './pages/sales/OrdersPage'
import { NotFoundPage } from './pages/NotFoundPage'

function App() {
  return (
    <IonApp>
      <IonReactRouter>
        <IonRouterOutlet>
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
                <AdminRoute>
                  <DashboardLayout>
                    <UsersPage />
                  </DashboardLayout>
                </AdminRoute>
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
            path="/sales/customers"
            render={() => (
              <ProtectedRoute>
                <DashboardLayout>
                  <CustomersPage />
                </DashboardLayout>
              </ProtectedRoute>
            )}
            exact
          />
          <Route
            path="/sales/quotations"
            render={() => (
              <ProtectedRoute>
                <DashboardLayout>
                  <QuotationsPage />
                </DashboardLayout>
              </ProtectedRoute>
            )}
            exact
          />
          <Route
            path="/sales/orders"
            render={() => (
              <ProtectedRoute>
                <DashboardLayout>
                  <OrdersPage />
                </DashboardLayout>
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
