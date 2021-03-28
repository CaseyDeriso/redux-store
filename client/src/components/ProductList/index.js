import React, { useEffect } from "react";
import { useQuery } from "@apollo/react-hooks";

import { useDispatch, useSelector } from "react-redux";

import { UPDATE_PRODUCTS } from "../../utils/actions";

import { idbPromise } from "../../utils/helpers";

import ProductItem from "../ProductItem";
import { QUERY_PRODUCTS } from "../../utils/queries";
import spinner from "../../assets/spinner.gif";

function ProductList() {
  const currentCategory = useSelector((state) => state.currentCategory);
  const state = useSelector((state) => state);

  const dispatch = useDispatch();

  const { loading, data } = useQuery(QUERY_PRODUCTS);

  useEffect(() => {
    if (data) {
      // store update in global state object
      dispatch({
        type: UPDATE_PRODUCTS,
        products: data.products,
      });

      // store update in IndexedDb
      data.products.forEach((product) => {
        idbPromise("products", "put", product);
      });
    } else if (!loading) {
      // if were offline, get data from products store in IDB
      idbPromise("products", "get").then((products) => {
        // use retrieved data to set global state for offline browsing
        dispatch({
          type: UPDATE_PRODUCTS,
          products,
        });
      });
    }
  }, [data, loading, dispatch]);

  function filterProducts() {
    if (!currentCategory) {
      return state.products;
    }

    return state.products.filter(
      (product) => product.category._id === currentCategory
    );
  }

  return (
    <div className="my-2">
      <h2>Our Products:</h2>
      {state.products.length ? (
        <div className="flex-row">
          {filterProducts().map((product) => (
            <ProductItem
              key={product._id}
              _id={product._id}
              image={product.image}
              name={product.name}
              price={product.price}
              quantity={product.quantity}
            />
          ))}
        </div>
      ) : (
        <h3>You haven't added any products yet!</h3>
      )}
      {loading ? <img src={spinner} alt="loading" /> : null}
    </div>
  );
}

export default ProductList;
