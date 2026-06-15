/**
 * Przelewy24 (P24) Payment Module Provider for Medusa
 */
import { ModuleProvider, Modules } from "@medusajs/framework/utils";
import P24BlikService from "./services/p24-blik";
import P24CardsService from "./services/p24-cards";
import P24ProviderService from "./services/p24-provider";
import P24VisaMobileService from "./services/p24-visa-mobile";

const services = [
  P24BlikService,
  P24CardsService,
  P24ProviderService,
  P24VisaMobileService,
];

export default ModuleProvider(Modules.PAYMENT, {
  services,
});
