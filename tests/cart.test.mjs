import test from "node:test";
import assert from "node:assert/strict";
import { cartQuantity, normalizeCart } from "../src/lib/cart.ts";

test("cart keeps valid products, combines duplicates and limits quantities", () => {
  assert.deepEqual(normalizeCart([
    { slug: "peca-religiosa", quantity: 2 },
    { slug: "peca-religiosa", quantity: 3 },
    { slug: "peca-decorativa", quantity: 120 },
    { slug: "produto-inexistente", quantity: 4 },
    { slug: "estatua-personalizada", quantity: 0 },
  ]), [
    { slug: "peca-religiosa", quantity: 5 },
    { slug: "peca-decorativa", quantity: 99 },
  ]);
});

test("cart rejects malformed saved data and calculates total quantity", () => {
  assert.deepEqual(normalizeCart(null), []);
  assert.deepEqual(normalizeCart([{ slug: "peca-religiosa", quantity: "2" }]), []);
  assert.equal(cartQuantity([{ slug: "peca-religiosa", quantity: 2 }, { slug: "peca-decorativa", quantity: 3 }]), 5);
});
