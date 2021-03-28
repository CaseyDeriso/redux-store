import React, { useEffect } from "react";
import { useQuery } from "@apollo/react-hooks";
import { QUERY_CATEGORIES } from "../../utils/queries";
import {
  UPDATE_CATEGORIES,
  UPDATE_CURRENT_CATEGORY,
} from "../../utils/actions";
import { useDispatch, useSelector } from "react-redux";


import { idbPromise } from "../../utils/helpers";

function CategoryMenu({ setCategory }) {
  const categories = useSelector(state => state.categories);

  const dispatch = useDispatch();

  const { loading, data: categoryData } = useQuery(QUERY_CATEGORIES);

  // create useEffect to dispatch categories once query is handled
  useEffect(() => {
    // if categoryData exists or has changed from the response of useQuery, then run dispatch
    if (categoryData) {
      // execute our dispatch function with our action object indicating the type of action and the data to set our state for categories to
      dispatch({
        type: UPDATE_CATEGORIES,
        categories: categoryData.categories,
      });

      categoryData.categories.forEach((category) => {
        idbPromise("categories", "put", category);
      });
    } else if (!loading) {
      // if there is no connection, get categories from IDB to dispatch
      idbPromise("categories", "get", categories).then((categories) => {
        dispatch({
          type: UPDATE_CATEGORIES,
          categories,
        });
      });
    }
  }, [categoryData, dispatch]);

  const handleClick = (id) => {
    dispatch({
      type: UPDATE_CURRENT_CATEGORY,
      currentCategory: id,
    });
  };

  return (
    <div>
      <h2>Choose a Category:</h2>
      {categories.map((item) => (
        <button
          key={item._id}
          onClick={() => {
            handleClick(item._id);
          }}
        >
          {item.name}
        </button>
      ))}
    </div>
  );
}

export default CategoryMenu;
