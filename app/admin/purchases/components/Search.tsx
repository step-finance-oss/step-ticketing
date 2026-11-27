"use client"

import SearchInput from "components/UI/SearchInput"
import { useRouteQueryAdd } from "lib/client-utils"
import { useCallback } from "react"

interface SearchProps {
  query?: string
}

const Search = (props: SearchProps) => {
  const { query } = props

  const addToQuery = useRouteQueryAdd()

  const onSearch = useCallback(
    (value) => addToQuery({ query: value }, { scroll: false }),
    [addToQuery]
  )

  return <SearchInput defaultValue={query} onChange={onSearch} />
}

export default Search
