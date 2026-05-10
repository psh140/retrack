---
name: mybatis-query
description: >
  Retrack의 MyBatis XML mapper 파일 작성 스킬. mybatis-specialist 에이전트가 사용.
  SELECT/INSERT/UPDATE/DELETE 쿼리, resultMap, dynamic SQL(foreach, if, choose)을 PostgreSQL 문법으로 작성한다.
  직접 호출보다 retrack-backend 오케스트레이터를 통해 호출되는 것이 일반적.
---

# MyBatis XML 작성 가이드

## 1. 기본 파일 구조

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN"
        "http://mybatis.org/dtd/mybatis-3-mapper.dtd">

<!-- {도메인} 테이블에 대한 MyBatis mapper -->
<mapper namespace="com.retrack.mapper.{도메인}Mapper">

    <!-- {도메인} 기본 resultMap: snake_case → camelCase 매핑 -->
    <resultMap id="{도메인소문자}ResultMap" type="com.retrack.vo.{도메인}VO">
        <id property="{도메인소문자}Id" column="{도메인소문자}_id"/>
        <result property="userId" column="user_id"/>
        <result property="createdAt" column="created_at"/>
        <result property="updatedAt" column="updated_at"/>
    </resultMap>

    <!-- {도메인} 전체 목록 조회 -->
    <select id="findAll" resultMap="{도메인소문자}ResultMap">
        SELECT *
        FROM {테이블명}
        ORDER BY created_at DESC
    </select>

    <!-- ID로 {도메인} 조회 -->
    <select id="findById" parameterType="long" resultMap="{도메인소문자}ResultMap">
        SELECT *
        FROM {테이블명}
        WHERE {도메인소문자}_id = #{id}
    </select>

    <!-- {도메인} 등록 -->
    <insert id="insert" parameterType="com.retrack.vo.{도메인}VO">
        INSERT INTO {테이블명} (user_id, title, created_at)
        VALUES (#{userId}, #{title}, NOW())
    </insert>

</mapper>
```

## 2. resultMap 필수 사용 케이스

VO 필드(camelCase)와 DB 컬럼(snake_case)이 다를 때 반드시 resultMap 사용.
`resultType`만 쓰면 snake_case 컬럼이 null로 반환되는 버그 발생.

```xml
<!-- resultType만 쓰면 project_id → projectId 매핑이 안 됨 -->
<!-- 반드시 resultMap 사용 -->
<resultMap id="projectResultMap" type="com.retrack.vo.ProjectVO">
    <id property="projectId" column="project_id"/>
    <result property="managerId" column="manager_id"/>
    <result property="budgetTotal" column="budget_total"/>
    <result property="startDate" column="start_date"/>
    <result property="endDate" column="end_date"/>
    <result property="createdAt" column="created_at"/>
    <result property="updatedAt" column="updated_at"/>
</resultMap>
```

## 3. Dynamic SQL 패턴

### 조건 검색 (if)
```xml
<!-- 조건별 과제 목록 조회 -->
<select id="findByCondition" resultMap="projectResultMap">
    SELECT *
    FROM projects
    <where>
        <if test="status != null and status != ''">
            AND status = #{status}
        </if>
        <if test="userId != null">
            AND user_id = #{userId}
        </if>
    </where>
    ORDER BY created_at DESC
</select>
```

### IN 절 (foreach)
```xml
<!-- 여러 ID로 조회 -->
<select id="findByIds" resultMap="projectResultMap">
    SELECT * FROM projects
    WHERE project_id IN
    <foreach collection="ids" item="id" open="(" separator="," close=")">
        #{id}
    </foreach>
</select>
```

## 4. 권한별 조회 분기 패턴

ADMIN/MANAGER는 전체 조회, RESEARCHER/VIEWER는 본인 관련만:

```xml
<!-- 권한별 과제 목록 조회 -->
<select id="findAll" resultMap="projectResultMap">
    SELECT *
    FROM projects
    <where>
        <if test="userRole == 'RESEARCHER' or userRole == 'VIEWER'">
            AND (user_id = #{userId} OR manager_id = #{userId})
        </if>
    </where>
    ORDER BY created_at DESC
</select>
```

## 5. PostgreSQL 전용 문법

```xml
<!-- INSERT 후 생성된 ID 반환 -->
<insert id="insert" parameterType="com.retrack.vo.ProjectVO"
        useGeneratedKeys="true" keyProperty="projectId">
    INSERT INTO projects (user_id, title, status, created_at)
    VALUES (#{userId}, #{title}, 'DRAFT', NOW())
</insert>

<!-- 현재 시각: NOW() -->
<!-- 문자열 타입 비교: status::text = #{status} -->
<!-- BOOLEAN: is_verified = TRUE -->
```

## 6. UPDATE 패턴

```xml
<!-- 과제 정보 수정 (null 필드 제외) -->
<update id="update" parameterType="com.retrack.vo.ProjectVO">
    UPDATE projects
    <set>
        <if test="title != null">title = #{title},</if>
        <if test="description != null">description = #{description},</if>
        updated_at = NOW()
    </set>
    WHERE project_id = #{projectId}
</update>
```

## 7. 집계 쿼리 패턴

```xml
<!-- 연구비 카테고리별 집계 -->
<select id="findSummaryByProjectId" parameterType="long"
        resultType="map">
    SELECT
        category,
        SUM(amount) AS total
    FROM budget
    WHERE project_id = #{projectId}
    GROUP BY category
</select>
```

## 8. JOIN 패턴

```xml
<!-- 과제 + 신청자 정보 JOIN -->
<resultMap id="projectWithUserResultMap" type="com.retrack.vo.ProjectVO"
           extends="projectResultMap">
    <result property="applicantName" column="applicant_name"/>
    <result property="applicantEmail" column="applicant_email"/>
</resultMap>

<select id="findAllWithUser" resultMap="projectWithUserResultMap">
    SELECT p.*, u.name AS applicant_name, u.email AS applicant_email
    FROM projects p
    LEFT JOIN users u ON p.user_id = u.user_id
    ORDER BY p.created_at DESC
</select>
```
